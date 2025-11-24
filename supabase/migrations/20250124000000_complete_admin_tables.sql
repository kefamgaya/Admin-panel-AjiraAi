-- ============================================================================
-- Complete Admin Panel Database Migrations
-- Created: 2025-01-24
-- Description: Full migrations for all admin panel tables created today
-- ============================================================================

-- ============================================================================
-- 1. EARNINGS TABLE
-- Purpose: Store revenue from various sources (AdMob, subscriptions, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS earnings (
  id BIGSERIAL PRIMARY KEY,
  revenue_source TEXT NOT NULL, -- 'admob', 'subscription', 'featured_job', 'credits_purchase', etc.
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  earned_at TIMESTAMPTZ NOT NULL,
  metadata JSONB, -- Store additional data like impressions, clicks, CTR, eCPM for AdMob
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for earnings table
CREATE INDEX IF NOT EXISTS idx_earnings_revenue_source ON earnings(revenue_source);
CREATE INDEX IF NOT EXISTS idx_earnings_earned_at ON earnings(earned_at);
CREATE INDEX IF NOT EXISTS idx_earnings_created_at ON earnings(created_at);
CREATE INDEX IF NOT EXISTS idx_earnings_revenue_source_earned_at ON earnings(revenue_source, earned_at);

-- ============================================================================
-- 2. SUBSCRIPTION HISTORY TABLE
-- Purpose: Track company subscription plans and payments
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id BIGSERIAL PRIMARY KEY,
  company_uid TEXT NOT NULL,
  plan TEXT NOT NULL, -- 'free', 'basic', 'premium', etc.
  status TEXT NOT NULL, -- 'active', 'cancelled', 'expired'
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  amount NUMERIC(12, 2),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for subscription_history
CREATE INDEX IF NOT EXISTS idx_subscription_history_company_uid ON subscription_history(company_uid);
CREATE INDEX IF NOT EXISTS idx_subscription_history_status ON subscription_history(status);
CREATE INDEX IF NOT EXISTS idx_subscription_history_start_date ON subscription_history(start_date);

-- ============================================================================
-- 3. NOTIFICATION HISTORY TABLE
-- Purpose: Track all notifications sent through the platform
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_history (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_type TEXT NOT NULL, -- 'all', 'companies', 'seekers', 'specific'
  recipient_uids TEXT[], -- null for 'all', array of UIDs for 'specific'
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT NOT NULL, -- Admin UID who sent the notification
  delivery_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  metadata JSONB -- Additional notification data
);

-- Indexes for notification_history
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_by ON notification_history(sent_by);
CREATE INDEX IF NOT EXISTS idx_notification_history_recipient_type ON notification_history(recipient_type);

-- ============================================================================
-- 4. PLATFORM SETTINGS TABLE
-- Purpose: Store platform-wide configuration settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL, -- 'general', 'email', 'payment', 'security', 'admin', etc.
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT NOT NULL -- Admin UID who last updated
);

-- Indexes for platform_settings
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);

-- ============================================================================
-- 5. ADMIN USERS TABLE
-- Purpose: Manage admin user accounts and permissions
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL, -- Firebase Auth UID
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'Super Admin', 'Admin', 'Moderator'
  permissions JSONB, -- Role-based permissions object
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT, -- Admin UID who created this admin
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_uid ON admin_users(uid);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- ============================================================================
-- 6. ADMIN ACTIVITY LOGS TABLE
-- Purpose: Track all actions performed by admin users
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_uid TEXT NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', etc.
  resource_type TEXT NOT NULL, -- 'job', 'user', 'company', 'application', etc.
  resource_id TEXT, -- ID of the resource affected
  details JSONB, -- Additional action details
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for admin_activity_logs
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_uid ON admin_activity_logs(admin_uid);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_resource_type ON admin_activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_resource ON admin_activity_logs(resource_type, resource_id);

-- ============================================================================
-- 7. ACTIVITY LOGS TABLE
-- Purpose: Track all platform activities (admin, company, seeker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_uid TEXT,
  user_type TEXT, -- 'admin', 'company', 'seeker'
  action TEXT NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', etc.
  resource_type TEXT, -- 'job', 'application', 'profile', etc.
  resource_id TEXT, -- ID of the resource affected
  details JSONB, -- Additional action details
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_uid ON activity_logs(user_uid);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type ON activity_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- ============================================================================
-- 8. SCHEDULED REPORTS TABLE
-- Purpose: Store scheduled report configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id BIGSERIAL PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'user', 'job', 'application', 'financial', 'engagement'
  schedule TEXT NOT NULL, -- Cron expression
  recipients TEXT[] NOT NULL, -- Array of email addresses
  format TEXT NOT NULL, -- 'pdf', 'csv', 'excel'
  filters JSONB, -- Report filters
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for scheduled_reports
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_is_active ON scheduled_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_report_type ON scheduled_reports(report_type);

-- ============================================================================
-- 9. MODERATION QUEUE TABLE
-- Purpose: Queue content for moderation review
-- ============================================================================
CREATE TABLE IF NOT EXISTS moderation_queue (
  id BIGSERIAL PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'job', 'profile', 'message', 'application'
  content_id TEXT NOT NULL,
  reported_by TEXT, -- User UID who reported
  report_reason TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by TEXT, -- Admin UID who reviewed
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for moderation_queue
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content ON moderation_queue(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON moderation_queue(created_at);

-- ============================================================================
-- 10. CONTENT REPORTS TABLE
-- Purpose: Store user reports of inappropriate content
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_reports (
  id BIGSERIAL PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'job', 'profile', 'message', 'application'
  content_id TEXT NOT NULL,
  reported_by TEXT NOT NULL, -- User UID who reported
  report_category TEXT NOT NULL, -- 'spam', 'inappropriate', 'fraud', 'other'
  report_details TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
  resolved_by TEXT, -- Admin UID who resolved
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for content_reports
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_content ON content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_reported_by ON content_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at);

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Add columns to latest_jobs table
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS admin_notes TEXT;
-- Note: approved, pending, rejected may already exist as TEXT columns with 'yes'/'no' values
-- These ALTER statements will only add them if they don't exist
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS approved TEXT DEFAULT 'no'; -- 'yes', 'no'
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS pending TEXT DEFAULT 'yes'; -- 'yes', 'no'
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS rejected TEXT DEFAULT 'no'; -- 'yes', 'no'

-- Indexes for latest_jobs new columns
CREATE INDEX IF NOT EXISTS idx_latest_jobs_is_featured ON latest_jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_latest_jobs_approved ON latest_jobs(approved);
CREATE INDEX IF NOT EXISTS idx_latest_jobs_pending ON latest_jobs(pending);
CREATE INDEX IF NOT EXISTS idx_latest_jobs_rejected ON latest_jobs(rejected);

-- Add columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS blocked_by TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Indexes for companies new columns
CREATE INDEX IF NOT EXISTS idx_companies_is_blocked ON companies(is_blocked);

-- Add columns to all_users table
ALTER TABLE all_users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE all_users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE all_users ADD COLUMN IF NOT EXISTS blocked_by TEXT;
ALTER TABLE all_users ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Indexes for all_users new columns
CREATE INDEX IF NOT EXISTS idx_all_users_is_blocked ON all_users(is_blocked);

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, category, updated_by)
VALUES 
  ('admin_registration_enabled', '{"value": false}', 'admin', 'system'),
  ('platform_name', '{"value": "Ajira AI"}', 'general', 'system'),
  ('platform_email', '{"value": "admin@ajiraai.com"}', 'general', 'system')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE earnings IS 'Stores revenue from all sources including AdMob, subscriptions, featured jobs, and credit purchases';
COMMENT ON TABLE subscription_history IS 'Tracks company subscription plans and payment history';
COMMENT ON TABLE notification_history IS 'Records all notifications sent through the platform';
COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings stored as key-value pairs';
COMMENT ON TABLE admin_users IS 'Admin user accounts with role-based permissions';
COMMENT ON TABLE admin_activity_logs IS 'Audit log of all actions performed by admin users';
COMMENT ON TABLE activity_logs IS 'Comprehensive activity log for all platform users';
COMMENT ON TABLE scheduled_reports IS 'Configuration for automated report generation and delivery';
COMMENT ON TABLE moderation_queue IS 'Queue for content awaiting moderation review';
COMMENT ON TABLE content_reports IS 'User-submitted reports of inappropriate content';

COMMENT ON COLUMN earnings.revenue_source IS 'Source of revenue: admob, subscription, featured_job, credits_purchase, etc.';
COMMENT ON COLUMN earnings.metadata IS 'Additional data: for AdMob includes impressions, clicks, CTR, eCPM';
COMMENT ON COLUMN notification_history.recipient_type IS 'Type of recipients: all, companies, seekers, specific';
COMMENT ON COLUMN notification_history.recipient_uids IS 'Array of UIDs for specific recipients, null for all';
COMMENT ON COLUMN platform_settings.setting_value IS 'JSONB object containing the setting value, typically {"value": <actual_value>}';
COMMENT ON COLUMN admin_users.permissions IS 'JSONB object defining role-based permissions';
COMMENT ON COLUMN admin_activity_logs.details IS 'JSONB object with additional action context';
COMMENT ON COLUMN activity_logs.details IS 'JSONB object with additional action context';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

