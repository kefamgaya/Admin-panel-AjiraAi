-- ============================================================================
-- Admin Panel Core Tables Migration
-- Created: 2025-01-24
-- Description: Full migration for core admin panel tables
-- Tables: admin_users, content_reports, earnings, moderation_queue, 
--         notification_history, platform_settings
-- ============================================================================

-- ============================================================================
-- 1. ADMIN USERS TABLE
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
-- 2. CONTENT REPORTS TABLE
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
CREATE INDEX IF NOT EXISTS idx_content_reports_category ON content_reports(report_category);

-- ============================================================================
-- 3. EARNINGS TABLE
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
-- 4. MODERATION QUEUE TABLE
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
CREATE INDEX IF NOT EXISTS idx_moderation_queue_reviewed_by ON moderation_queue(reviewed_by);

-- ============================================================================
-- 5. NOTIFICATION HISTORY TABLE
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
CREATE INDEX IF NOT EXISTS idx_notification_history_created_at ON notification_history(sent_at);

-- ============================================================================
-- 6. PLATFORM SETTINGS TABLE
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
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE admin_users IS 'Admin user accounts with role-based permissions';
COMMENT ON TABLE content_reports IS 'User-submitted reports of inappropriate content';
COMMENT ON TABLE earnings IS 'Stores revenue from all sources including AdMob, subscriptions, featured jobs, and credit purchases';
COMMENT ON TABLE moderation_queue IS 'Queue for content awaiting moderation review';
COMMENT ON TABLE notification_history IS 'Records all notifications sent through the platform';
COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings stored as key-value pairs';

COMMENT ON COLUMN admin_users.uid IS 'Firebase Auth UID for the admin user';
COMMENT ON COLUMN admin_users.permissions IS 'JSONB object defining role-based permissions';
COMMENT ON COLUMN admin_users.role IS 'Admin role: Super Admin, Admin, or Moderator';
COMMENT ON COLUMN content_reports.content_type IS 'Type of content reported: job, profile, message, application';
COMMENT ON COLUMN content_reports.report_category IS 'Category of report: spam, inappropriate, fraud, other';
COMMENT ON COLUMN content_reports.status IS 'Report status: pending, resolved, dismissed';
COMMENT ON COLUMN earnings.revenue_source IS 'Source of revenue: admob, subscription, featured_job, credits_purchase, etc.';
COMMENT ON COLUMN earnings.metadata IS 'Additional data: for AdMob includes impressions, clicks, CTR, eCPM';
COMMENT ON COLUMN moderation_queue.content_type IS 'Type of content in queue: job, profile, message, application';
COMMENT ON COLUMN moderation_queue.status IS 'Moderation status: pending, approved, rejected';
COMMENT ON COLUMN notification_history.recipient_type IS 'Type of recipients: all, companies, seekers, specific';
COMMENT ON COLUMN notification_history.recipient_uids IS 'Array of UIDs for specific recipients, null for all';
COMMENT ON COLUMN platform_settings.setting_value IS 'JSONB object containing the setting value, typically {"value": <actual_value>}';
COMMENT ON COLUMN platform_settings.category IS 'Setting category: general, email, payment, security, admin, etc.';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

