-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  flag_key TEXT NOT NULL UNIQUE,
  premium_only BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  child_id TEXT,
  url TEXT NOT NULL,
  type TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  FOREIGN KEY (child_id) REFERENCES children (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags (flag_key);
CREATE INDEX IF NOT EXISTS idx_media_assets_user ON media_assets (user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_child ON media_assets (child_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets (type); 