-- Users (Guardians)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  auth_provider TEXT,
  auth_provider_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Families
CREATE TABLE families (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family Members (Links users to families)
CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'guardian',
  FOREIGN KEY (family_id) REFERENCES families(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Children
CREATE TABLE children (
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
CREATE TABLE challenges (
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
CREATE TABLE challenge_logs (
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
CREATE TABLE techniques (
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
CREATE TABLE journal_entries (
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
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('free', 'premium')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id)
);

-- Feature Flags
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  flag_key TEXT NOT NULL UNIQUE,
  premium_only BOOLEAN DEFAULT TRUE
);

-- Media Assets
CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  child_id TEXT,
  url TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 