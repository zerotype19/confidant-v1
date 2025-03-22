-- Drop the sessions table since we're using third-party auth
DROP TABLE IF EXISTS sessions;

-- Recreate users table with correct schema
CREATE TABLE new_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  auth_provider TEXT,
  auth_provider_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data
INSERT INTO new_users (id, email, name, created_at, updated_at)
SELECT id, email, name, created_at, updated_at FROM users;

-- Drop old table and rename new one
DROP TABLE users;
ALTER TABLE new_users RENAME TO users; 