-- Create techniques table
CREATE TABLE IF NOT EXISTS techniques (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT NOT NULL,
  example_dialogue TEXT NOT NULL,
  common_mistakes TEXT NOT NULL,
  use_cases TEXT NOT NULL,
  pillar_ids TEXT NOT NULL,
  age_range TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create technique_completions table
CREATE TABLE IF NOT EXISTS technique_completions (
  id TEXT PRIMARY KEY,
  technique_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reflection TEXT,
  mood_rating INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (technique_id) REFERENCES techniques(id)
); 