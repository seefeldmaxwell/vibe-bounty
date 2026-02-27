-- Add Google and Microsoft OAuth ID columns to users table
ALTER TABLE users ADD COLUMN google_id TEXT;
ALTER TABLE users ADD COLUMN microsoft_id TEXT;

-- Create indexes for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id);
