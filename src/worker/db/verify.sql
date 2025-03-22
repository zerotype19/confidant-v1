-- Check tables
SELECT name FROM sqlite_master WHERE type='table';

-- Check users table structure
PRAGMA table_info(users);

-- Check sessions table structure
PRAGMA table_info(sessions);

-- Check indexes
SELECT name, sql FROM sqlite_master WHERE type='index'; 