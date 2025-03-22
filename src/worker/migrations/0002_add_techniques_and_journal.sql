-- Create techniques table
CREATE TABLE IF NOT EXISTS techniques (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  steps TEXT,
  example_dialogue TEXT,
  common_mistakes TEXT,
  use_cases TEXT,
  pillar_ids TEXT,
  age_range TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  entry TEXT NOT NULL,
  tags TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children (id) ON DELETE CASCADE
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('free', 'premium')),
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON journal_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_child ON journal_entries (child_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_family ON subscriptions (family_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status); 