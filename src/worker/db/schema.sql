-- Users (Guardians)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  auth_provider TEXT,
  auth_provider_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Families
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family Members (Links users to families)
CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'guardian',
  FOREIGN KEY (family_id) REFERENCES families(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Children
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id)
);

-- Challenges (static library)
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  steps TEXT,
  example_dialogue TEXT,
  tip TEXT,
  pillar_id INTEGER,
  age_range TEXT,
  difficulty_level INTEGER
);

-- Challenge Logs
CREATE TABLE IF NOT EXISTS challenge_logs (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  completed_by_user_id TEXT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reflection TEXT,
  mood_rating INTEGER,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id),
  FOREIGN KEY (completed_by_user_id) REFERENCES users(id)
);

-- Techniques (static library)
CREATE TABLE IF NOT EXISTS techniques (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  steps TEXT,
  example_dialogue TEXT,
  common_mistakes TEXT,
  use_cases TEXT,
  pillar_ids TEXT,
  age_range TEXT
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  entry TEXT NOT NULL,
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES children(id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('free', 'premium')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id)
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  flag_key TEXT NOT NULL UNIQUE,
  premium_only BOOLEAN DEFAULT TRUE
);

-- Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  child_id TEXT,
  url TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_children_family_id ON children(family_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_child_id ON challenge_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_challenge_id ON challenge_logs(challenge_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_child_id ON journal_entries(child_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_child_id ON media_assets(child_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON media_assets(user_id); 