-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  school_name TEXT,
  grade TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create challenge_logs table
CREATE TABLE IF NOT EXISTS challenge_logs (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  reflection TEXT,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Create trigger to update parents.updated_at
CREATE TRIGGER IF NOT EXISTS parents_updated_at 
AFTER UPDATE ON parents
BEGIN
  UPDATE parents SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Create trigger to update children.updated_at
CREATE TRIGGER IF NOT EXISTS children_updated_at 
AFTER UPDATE ON children
BEGIN
  UPDATE children SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Create trigger to update challenges.updated_at
CREATE TRIGGER IF NOT EXISTS challenges_updated_at 
AFTER UPDATE ON challenges
BEGIN
  UPDATE challenges SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END; 