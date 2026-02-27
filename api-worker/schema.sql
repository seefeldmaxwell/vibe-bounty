-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE,
  email TEXT UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'builder' CHECK(role IN ('poster','builder','both','admin')),
  reputation INTEGER DEFAULT 0,
  total_earned REAL DEFAULT 0,
  total_posted REAL DEFAULT 0,
  github_url TEXT,
  portfolio_url TEXT,
  password_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Bounties
CREATE TABLE IF NOT EXISTS bounties (
  id TEXT PRIMARY KEY,
  poster_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  detailed_spec TEXT,
  budget_min REAL NOT NULL,
  budget_max REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  deadline TEXT,
  status TEXT DEFAULT 'open' CHECK(status IN ('draft','open','in_review','awarded','cancelled','expired')),
  category TEXT CHECK(category IN ('landing-page','web-app','mobile-app','api','cli-tool','game','chrome-ext','other')),
  tags TEXT,
  tech_stack TEXT,
  difficulty TEXT CHECK(difficulty IN ('beginner','intermediate','advanced','expert')),
  max_submissions INTEGER DEFAULT 50,
  submission_count INTEGER DEFAULT 0,
  winner_id TEXT,
  awarded_amount REAL,
  visibility TEXT DEFAULT 'public' CHECK(visibility IN ('public','invite_only')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  bounty_id TEXT NOT NULL REFERENCES bounties(id),
  builder_id TEXT NOT NULL REFERENCES users(id),
  title TEXT,
  description TEXT,
  preview_url TEXT,
  repo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','deploying','live','failed','withdrawn','winner','rejected')),
  deploy_log TEXT,
  score INTEGER,
  feedback TEXT,
  tech_used TEXT,
  submitted_at TEXT DEFAULT (datetime('now')),
  deployed_at TEXT,
  reviewed_at TEXT
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  bounty_id TEXT NOT NULL REFERENCES bounties(id),
  submission_id TEXT REFERENCES submissions(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Submission files
CREATE TABLE IF NOT EXISTS submission_files (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER,
  content_type TEXT,
  r2_key TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sessions for auth
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
