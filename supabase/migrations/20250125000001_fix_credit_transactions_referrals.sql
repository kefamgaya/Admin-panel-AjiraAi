-- ============================================================================
-- Credit Transactions Table Fixes for Referral System
-- ============================================================================
-- This migration improves the credit_transactions table to better support
-- referral-related transactions and adds missing indexes and constraints.
-- ============================================================================

-- Step 1: Add missing columns if they don't exist
ALTER TABLE credit_transactions
  ADD COLUMN IF NOT EXISTS referral_id BIGINT REFERENCES referrals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 2: Update transaction_type check constraint to ensure all referral types are included
-- First, check if constraint exists and what it contains
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;
  
  -- Add updated constraint with all transaction types
  ALTER TABLE credit_transactions
    ADD CONSTRAINT credit_transactions_transaction_type_check
    CHECK (transaction_type = ANY (ARRAY[
      'referral_reward'::text,
      'referral_signup'::text,
      'purchase'::text,
      'usage'::text,
      'refund'::text,
      'bonus'::text,
      'expired'::text,
      'reversed'::text
    ]));
END $$;

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_uid ON credit_transactions(user_uid);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_transaction_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference_id ON credit_transactions(reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_credit_transactions_referral_id ON credit_transactions(referral_id) WHERE referral_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_type ON credit_transactions(user_uid, transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON credit_transactions(user_uid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type_created ON credit_transactions(transaction_type, created_at DESC);

-- Step 4: Add constraint to ensure amount is not zero
ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_amount_non_zero_check
  CHECK (amount != 0);

-- Step 5: Add foreign key constraint for referral_id (if not exists)
-- Note: This was added in Step 1, but ensuring it's properly set up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'credit_transactions_referral_id_fkey'
  ) THEN
    ALTER TABLE credit_transactions
      ADD CONSTRAINT credit_transactions_referral_id_fkey
      FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Step 6: Create function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credit_balance(user_uid TEXT)
RETURNS INTEGER AS $$
DECLARE
  balance INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0)::INTEGER INTO balance
  FROM credit_transactions
  WHERE credit_transactions.user_uid = user_uid;
  
  RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to get referral-related credit transactions
CREATE OR REPLACE FUNCTION get_referral_credit_transactions(referral_id_param BIGINT)
RETURNS TABLE (
  id BIGINT,
  user_uid TEXT,
  transaction_type TEXT,
  amount INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.user_uid,
    ct.transaction_type,
    ct.amount,
    ct.description,
    ct.created_at
  FROM credit_transactions ct
  WHERE ct.referral_id = referral_id_param
  ORDER BY ct.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create view for credit transaction analytics
CREATE OR REPLACE VIEW credit_transaction_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  transaction_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  SUM(amount) FILTER (WHERE amount > 0) as total_credits_added,
  SUM(amount) FILTER (WHERE amount < 0) as total_credits_used
FROM credit_transactions
GROUP BY DATE_TRUNC('day', created_at), transaction_type
ORDER BY date DESC, transaction_type;

-- Step 9: Add comments for documentation
COMMENT ON COLUMN credit_transactions.referral_id IS 'Reference to the referral that triggered this transaction (if applicable)';
COMMENT ON COLUMN credit_transactions.metadata IS 'Additional JSON metadata for extensibility';
COMMENT ON COLUMN credit_transactions.expires_at IS 'Expiration date for credit transactions (if applicable)';
COMMENT ON COLUMN credit_transactions.notes IS 'Admin notes or internal comments about this transaction';

-- Step 10: Create trigger to validate referral transactions
CREATE OR REPLACE FUNCTION validate_referral_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- If transaction is referral-related, ensure referral_id is set
  IF NEW.transaction_type IN ('referral_reward', 'referral_signup') AND NEW.referral_id IS NULL THEN
    RAISE WARNING 'Referral transaction type % should have referral_id set', NEW.transaction_type;
  END IF;
  
  -- If referral_id is set, ensure transaction type is referral-related
  IF NEW.referral_id IS NOT NULL AND NEW.transaction_type NOT IN ('referral_reward', 'referral_signup') THEN
    RAISE WARNING 'Transaction with referral_id should have referral-related transaction_type';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_referral_transaction_trigger ON credit_transactions;
CREATE TRIGGER validate_referral_transaction_trigger
  BEFORE INSERT OR UPDATE ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_referral_transaction();

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary of changes:
-- ✓ Added referral_id foreign key to link transactions to referrals
-- ✓ Added metadata, expires_at, and notes columns
-- ✓ Updated transaction_type constraint to include all types
-- ✓ Added performance indexes
-- ✓ Added data integrity constraints
-- ✓ Added helper functions for credit balance and referral transactions
-- ✓ Added analytics view
-- ✓ Added validation trigger
-- ============================================================================

