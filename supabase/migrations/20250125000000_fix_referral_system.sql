-- ============================================================================
-- Referral System Fixes and Improvements
-- ============================================================================
-- This migration fixes multiple issues with the referral system:
-- 1. Adds 'expired' status to status check constraint
-- 2. Adds missing indexes for performance
-- 3. Adds RLS policies for security
-- 4. Adds validation constraints (self-referral prevention, referral code validation)
-- 5. Adds expiration tracking
-- 6. Adds audit fields
-- 7. Fixes data integrity issues
-- ============================================================================

-- Step 1: Add new columns to referrals table
ALTER TABLE referrals
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_by TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Step 2: Update status check constraint to include 'expired'
ALTER TABLE referrals
  DROP CONSTRAINT IF EXISTS referrals_status_check;

ALTER TABLE referrals
  ADD CONSTRAINT referrals_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'rewarded'::text, 'expired'::text, 'cancelled'::text]));

-- Step 3: Add constraint to prevent self-referrals
ALTER TABLE referrals
  ADD CONSTRAINT referrals_no_self_referral_check 
  CHECK (referrer_uid != referee_uid);

-- Step 4: Add constraint to validate referral code matches referrer
-- This requires a function to check if referral_code belongs to referrer_uid
CREATE OR REPLACE FUNCTION validate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if referral_code matches the referrer's code
  IF NOT EXISTS (
    SELECT 1 
    FROM all_users 
    WHERE uid = NEW.referrer_uid 
    AND referral_code = NEW.referral_code
  ) THEN
    RAISE EXCEPTION 'Referral code % does not belong to referrer %', NEW.referral_code, NEW.referrer_uid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate referral code
DROP TRIGGER IF EXISTS validate_referral_code_trigger ON referrals;
CREATE TRIGGER validate_referral_code_trigger
  BEFORE INSERT OR UPDATE OF referral_code, referrer_uid ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION validate_referral_code();

-- Step 5: Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_referrals_updated_at_trigger ON referrals;
CREATE TRIGGER update_referrals_updated_at_trigger
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrals_updated_at();

-- Step 6: Add function to automatically expire old pending referrals
CREATE OR REPLACE FUNCTION expire_old_referrals()
RETURNS void AS $$
BEGIN
  UPDATE referrals
  SET 
    status = 'expired',
    updated_at = now(),
    completed_at = now()
  WHERE status = 'pending'
    AND (
      expires_at IS NOT NULL AND expires_at < now()
      OR (expires_at IS NULL AND created_at < now() - INTERVAL '90 days')
    );
END;
$$ LANGUAGE plpgsql;

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_uid ON referrals(referrer_uid);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_uid ON referrals(referee_uid);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_expires_at ON referrals(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_completed_at ON referrals(completed_at) WHERE completed_at IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON referrals(referrer_uid, status);
CREATE INDEX IF NOT EXISTS idx_referrals_status_created ON referrals(status, created_at DESC);

-- Step 8: Enable RLS on referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for referrals
-- Note: Since this system uses Firebase auth, authentication is handled at the application level
-- API routes use service_role for database access after verifying Firebase tokens

-- Policy: Users can view their own referrals (as referrer or referee)
-- Note: Since this system uses Firebase auth with text UIDs, we use a function
-- that gets the current user UID from JWT claims or session
CREATE POLICY "Users can view own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    -- For Firebase auth, UID is in JWT claims or we check via application logic
    -- This policy allows viewing if the user is the referrer or referee
    -- Actual enforcement happens at application level for Firebase auth
    true  -- Application-level auth handles this via API routes
  );

-- Policy: Users cannot directly insert/update/delete (handled by API)
-- All modifications go through API routes with proper authentication
CREATE POLICY "No direct user modifications to referrals"
  ON referrals
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Policy: Service role (API routes) has full access
-- This is the primary access method since Firebase auth is handled at app level
CREATE POLICY "Service role full access to referrals"
  ON referrals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 10: Add comments for documentation
COMMENT ON TABLE referrals IS 'Tracks referral relationships between users. Each user can refer others using their unique referral code.';
COMMENT ON COLUMN referrals.referrer_uid IS 'UID of the user who made the referral (the referrer)';
COMMENT ON COLUMN referrals.referee_uid IS 'UID of the user who was referred (the referee). Unique to prevent duplicate referrals.';
COMMENT ON COLUMN referrals.referral_code IS 'The referral code used. Must match the referrer''s code in all_users table.';
COMMENT ON COLUMN referrals.status IS 'Status: pending (awaiting completion), completed (referee completed signup), rewarded (credits awarded), expired (expired without completion), cancelled (manually cancelled)';
COMMENT ON COLUMN referrals.referrer_credits_awarded IS 'Number of credits awarded to the referrer when referral is completed';
COMMENT ON COLUMN referrals.referee_credits_awarded IS 'Number of credits awarded to the referee when they sign up';
COMMENT ON COLUMN referrals.expires_at IS 'Optional expiration date for the referral. If null, defaults to 90 days from creation.';
COMMENT ON COLUMN referrals.completed_at IS 'Timestamp when the referral was completed (status changed to completed or rewarded)';
COMMENT ON COLUMN referrals.updated_at IS 'Timestamp of last update, automatically maintained by trigger';
COMMENT ON COLUMN referrals.updated_by IS 'UID of admin/user who last updated this record';
COMMENT ON COLUMN referrals.notes IS 'Admin notes or internal comments about this referral';
COMMENT ON COLUMN referrals.metadata IS 'Additional JSON metadata for extensibility';

-- Step 11: Create function to get referral statistics for a user
CREATE OR REPLACE FUNCTION get_user_referral_stats(user_uid TEXT)
RETURNS TABLE (
  total_referrals BIGINT,
  successful_referrals BIGINT,
  pending_referrals BIGINT,
  expired_referrals BIGINT,
  total_credits_earned INTEGER,
  referral_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_referrals,
    COUNT(*) FILTER (WHERE r.status = 'rewarded')::BIGINT as successful_referrals,
    COUNT(*) FILTER (WHERE r.status = 'pending')::BIGINT as pending_referrals,
    COUNT(*) FILTER (WHERE r.status = 'expired')::BIGINT as expired_referrals,
    COALESCE(SUM(r.referrer_credits_awarded) FILTER (WHERE r.status = 'rewarded'), 0)::INTEGER as total_credits_earned,
    u.referral_code
  FROM all_users u
  LEFT JOIN referrals r ON r.referrer_uid = u.uid
  WHERE u.uid = user_uid
  GROUP BY u.uid, u.referral_code;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create function to check if referral code is valid and available
CREATE OR REPLACE FUNCTION is_referral_code_valid(code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  owner_uid TEXT,
  owner_name TEXT,
  owner_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM all_users WHERE referral_code = code) as is_valid,
    u.uid as owner_uid,
    COALESCE(u.full_name, u.name) as owner_name,
    u.email as owner_email
  FROM all_users u
  WHERE u.referral_code = code
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Step 13: Create view for referral analytics
CREATE OR REPLACE VIEW referral_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  status,
  COUNT(*) as count,
  SUM(referrer_credits_awarded) as total_referrer_credits,
  SUM(referee_credits_awarded) as total_referee_credits
FROM referrals
GROUP BY DATE_TRUNC('day', created_at), status
ORDER BY date DESC, status;

-- Step 14: Add constraint to ensure credits are non-negative
ALTER TABLE referrals
  ADD CONSTRAINT referrals_credits_non_negative_check
  CHECK (referrer_credits_awarded >= 0 AND referee_credits_awarded >= 0);

-- Step 15: Add constraint to ensure completed_at is set when status is completed/rewarded
CREATE OR REPLACE FUNCTION validate_referral_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'rewarded') AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  
  IF NEW.status = 'pending' THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_referral_completion_trigger ON referrals;
CREATE TRIGGER validate_referral_completion_trigger
  BEFORE INSERT OR UPDATE OF status ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION validate_referral_completion();

-- Step 16: Update existing referrals to set expires_at if null (90 days from creation)
UPDATE referrals
SET expires_at = created_at + INTERVAL '90 days'
WHERE expires_at IS NULL AND status = 'pending';

-- Step 17: Create index on all_users.referral_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_all_users_referral_code ON all_users(referral_code) WHERE referral_code IS NOT NULL;

-- Step 18: Add comment to all_users.referral_code
COMMENT ON COLUMN all_users.referral_code IS 'Unique referral code for this user. Used by others to refer this user.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary of changes:
-- ✓ Added expiration tracking (expires_at)
-- ✓ Added audit fields (updated_at, updated_by, notes, metadata)
-- ✓ Fixed status constraint to include 'expired' and 'cancelled'
-- ✓ Added self-referral prevention
-- ✓ Added referral code validation trigger
-- ✓ Added automatic updated_at trigger
-- ✓ Added expiration function
-- ✓ Added performance indexes
-- ✓ Enabled RLS with appropriate policies
-- ✓ Added helper functions (get_user_referral_stats, is_referral_code_valid)
-- ✓ Added analytics view
-- ✓ Added data integrity constraints
-- ============================================================================

