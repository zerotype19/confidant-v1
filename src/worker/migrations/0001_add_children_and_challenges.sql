-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  avatar_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE
);

-- Create challenges table
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
  difficulty_level INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create challenge_logs table
CREATE TABLE IF NOT EXISTS challenge_logs (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  completed_by_user_id TEXT NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reflection TEXT,
  mood_rating INTEGER,
  FOREIGN KEY (child_id) REFERENCES children (id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges (id) ON DELETE CASCADE,
  FOREIGN KEY (completed_by_user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_children_family ON children (family_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_child ON challenge_logs (child_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_challenge ON challenge_logs (challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_user ON challenge_logs (completed_by_user_id); 