# Referral System SQL Migrations

This document describes the comprehensive SQL migrations created to fix all referral system issues.

## Migration Files

1. **20250125000000_fix_referral_system.sql** - Main referral table fixes
2. **20250125000001_fix_credit_transactions_referrals.sql** - Credit transactions improvements

## Issues Fixed

### 1. Status Constraint Mismatch
- **Problem**: Status check constraint only allowed `pending`, `completed`, `rewarded`, but UI code used `expired`
- **Fix**: Updated constraint to include `expired` and `cancelled` statuses

### 2. Missing Indexes
- **Problem**: No indexes on foreign keys or commonly queried columns, causing slow queries
- **Fix**: Added indexes on:
  - `referrer_uid`
  - `referee_uid`
  - `status`
  - `created_at`
  - `referral_code`
  - `expires_at`
  - Composite indexes for common query patterns

### 3. Missing RLS Policies
- **Problem**: Referrals table had RLS disabled, potential security issue
- **Fix**: Enabled RLS and added policies:
  - Service role has full access (for API routes)
  - Users can view their own referrals
  - Users cannot directly modify referrals (handled by API)

### 4. Missing Validation Constraints
- **Problem**: No prevention of self-referrals or validation of referral codes
- **Fix**: 
  - Added constraint to prevent `referrer_uid = referee_uid`
  - Added trigger to validate referral code matches referrer's code

### 5. Missing Expiration Tracking
- **Problem**: No way to track or automatically expire old referrals
- **Fix**: 
  - Added `expires_at` column
  - Created function to automatically expire old pending referrals
  - Default expiration set to 90 days from creation

### 6. Missing Audit Fields
- **Problem**: No tracking of who updated records or when
- **Fix**: Added:
  - `updated_at` (auto-maintained by trigger)
  - `updated_by` (UID of admin/user who updated)
  - `notes` (admin notes)
  - `metadata` (JSON for extensibility)

### 7. Data Integrity Issues
- **Problem**: Missing constraints and validation
- **Fix**: 
  - Added non-negative credit constraints
  - Added automatic `completed_at` setting when status changes
  - Added validation triggers

### 8. Credit Transactions Improvements
- **Problem**: Credit transactions table missing referral linkage and indexes
- **Fix**: 
  - Added `referral_id` foreign key
  - Added metadata and notes columns
  - Added performance indexes
  - Added validation triggers
  - Created helper functions and analytics views

## New Functions

### `get_user_referral_stats(user_uid TEXT)`
Returns referral statistics for a specific user:
- Total referrals
- Successful referrals
- Pending referrals
- Expired referrals
- Total credits earned
- Referral code

### `is_referral_code_valid(code TEXT)`
Checks if a referral code is valid and returns owner information.

### `expire_old_referrals()`
Automatically expires old pending referrals (90+ days old or past expiration date).

### `get_user_credit_balance(user_uid TEXT)`
Calculates current credit balance for a user.

### `get_referral_credit_transactions(referral_id_param BIGINT)`
Returns all credit transactions related to a specific referral.

## New Views

### `referral_analytics`
Daily referral statistics grouped by status with credit totals.

### `credit_transaction_analytics`
Daily credit transaction statistics grouped by type.

## How to Apply

1. **Using Supabase CLI:**
   ```bash
   supabase db push
   ```

2. **Using Supabase Dashboard:**
   - Go to SQL Editor
   - Copy and paste the migration SQL
   - Execute

3. **Using MCP Supabase:**
   ```typescript
   await mcp_supabase_apply_migration({
     name: "fix_referral_system",
     query: migration_sql
   });
   ```

## Testing

After applying migrations, verify:

1. ✅ Status constraint accepts 'expired' and 'cancelled'
2. ✅ Self-referrals are prevented
3. ✅ Referral code validation works
4. ✅ Indexes are created (check with `\d+ referrals`)
5. ✅ RLS policies are active
6. ✅ Triggers are working (check `updated_at` auto-update)
7. ✅ Helper functions return correct data

## Rollback

If you need to rollback, you can:

1. Drop the new columns:
   ```sql
   ALTER TABLE referrals DROP COLUMN IF EXISTS expires_at;
   ALTER TABLE referrals DROP COLUMN IF EXISTS updated_at;
   ALTER TABLE referrals DROP COLUMN IF EXISTS updated_by;
   ALTER TABLE referrals DROP COLUMN IF EXISTS notes;
   ALTER TABLE referrals DROP COLUMN IF EXISTS metadata;
   ```

2. Drop triggers and functions:
   ```sql
   DROP TRIGGER IF EXISTS validate_referral_code_trigger ON referrals;
   DROP TRIGGER IF EXISTS update_referrals_updated_at_trigger ON referrals;
   DROP TRIGGER IF EXISTS validate_referral_completion_trigger ON referrals;
   DROP FUNCTION IF EXISTS validate_referral_code();
   DROP FUNCTION IF EXISTS update_referrals_updated_at();
   DROP FUNCTION IF EXISTS expire_old_referrals();
   DROP FUNCTION IF EXISTS validate_referral_completion();
   ```

3. Drop indexes:
   ```sql
   DROP INDEX IF EXISTS idx_referrals_referrer_uid;
   DROP INDEX IF EXISTS idx_referrals_referee_uid;
   DROP INDEX IF EXISTS idx_referrals_status;
   -- ... (drop all other indexes)
   ```

4. Drop RLS policies:
   ```sql
   DROP POLICY IF EXISTS "Service role full access to referrals" ON referrals;
   DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
   DROP POLICY IF EXISTS "No direct user modifications to referrals" ON referrals;
   ```

## Notes

- The migration is idempotent (safe to run multiple times)
- Existing data is preserved
- Default expiration is set to 90 days for existing pending referrals
- All constraints are added with `IF NOT EXISTS` or `DROP IF EXISTS` for safety

