-- 1. Subscription History
CREATE TABLE IF NOT EXISTS subscription_history (
  id BIGSERIAL PRIMARY KEY,
  company_uid TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL, -- active, cancelled, expired
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  amount NUMERIC,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Notification History
CREATE TABLE IF NOT EXISTS notification_history (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_type TEXT NOT NULL, -- all, companies, seekers, specific
  recipient_uids TEXT[], -- null for all
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT NOT NULL,
  delivery_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0
);

-- 3. Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT NOT NULL
);

-- 4. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- 5. Admin Activity Logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_uid TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_uid TEXT,
  user_type TEXT, -- admin, company, seeker
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_uid ON activity_logs(user_uid);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- 7. Scheduled Reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id BIGSERIAL PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  schedule TEXT NOT NULL, -- cron expression
  recipients TEXT[] NOT NULL,
  format TEXT NOT NULL, -- pdf, csv, excel
  filters JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_sent_at TIMESTAMPTZ
);

-- 8. Moderation Queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id BIGSERIAL PRIMARY KEY,
  content_type TEXT NOT NULL, -- job, profile, message
  content_id TEXT NOT NULL,
  reported_by TEXT,
  report_reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Content Reports
CREATE TABLE IF NOT EXISTS content_reports (
  id BIGSERIAL PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  report_category TEXT NOT NULL, -- spam, inappropriate, fraud, other
  report_details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns to latest_jobs
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE latest_jobs ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add columns to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS blocked_by TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Add columns to all_users
ALTER TABLE all_users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE all_users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE all_users ADD COLUMN IF NOT EXISTS blocked_by TEXT;
ALTER TABLE all_users ADD COLUMN IF NOT EXISTS block_reason TEXT;



