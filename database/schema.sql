-- =====================================================================
-- TIMELENS — COMPLETE POSTGRESQL DATABASE SCHEMA (CLEAN STRUCTURE ONLY)
-- Contains all tables, columns, primary/foreign keys, constraints, and
-- performance indexes. Contains ZERO sample/demo rows.
-- =====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DAILY ENTRIES TABLE
CREATE TABLE IF NOT EXISTS daily_entries (
  daily_entry_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  day_type VARCHAR(50) NOT NULL DEFAULT 'Workday',
  main_goal TEXT,
  goal_category VARCHAR(100) DEFAULT 'Study',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_date)
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  task_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  daily_entry_id INTEGER NOT NULL REFERENCES daily_entries(daily_entry_id) ON DELETE CASCADE,
  task_name VARCHAR(255) NOT NULL,
  planned_minutes INTEGER NOT NULL DEFAULT 30,
  actual_minutes INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'planned',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
  activity_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  daily_entry_id INTEGER NOT NULL REFERENCES daily_entries(daily_entry_id) ON DELETE CASCADE,
  activity_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  activity_type VARCHAR(50) NOT NULL DEFAULT 'productive',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. GOALS TABLE
CREATE TABLE IF NOT EXISTS goals (
  goal_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  goal_name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  category VARCHAR(100) NOT NULL DEFAULT 'Study',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  target_minutes INTEGER DEFAULT 120,
  progress_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_entry ON tasks(user_id, daily_entry_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_entry ON activities(user_id, daily_entry_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_active ON goals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
