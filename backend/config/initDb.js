const { Client } = require("pg");
const pool = require("./db");

/**
 * Ensures the target PostgreSQL database exists (creates it if code 3D000)
 * and initializes all required TimeLens tables, columns, constraints, and indexes.
 */
const initializeDatabase = async () => {
  const connStr = pool.normalizeConnectionString(process.env.DATABASE_URL);

  try {
    await pool.query("SELECT 1");
  } catch (err) {
    // 3D000 = invalid_catalog_name (database does not exist)
    if (err && err.code === "3D000" && connStr) {
      const lastSlash = connStr.lastIndexOf("/");
      const baseUri = connStr.slice(0, lastSlash);
      const dbName = connStr.slice(lastSlash + 1).split("?")[0];

      if (dbName && /^[a-zA-Z0-9_-]+$/.test(dbName)) {
        const adminClient = new Client({
          connectionString: `${baseUri}/postgres`,
        });
        await adminClient.connect();
        try {
          await adminClient.query(`CREATE DATABASE "${dbName}"`);
          console.log(`Created PostgreSQL database "${dbName}".`);
        } catch (createErr) {
          if (createErr.code !== "42P04") {
            throw createErr;
          }
        } finally {
          await adminClient.end();
        }
      }
    } else {
      throw err;
    }
  }

  /* 1. users table */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /* 2. daily_entries table */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_entries (
      daily_entry_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      entry_date DATE NOT NULL,
      day_type VARCHAR(50) NOT NULL DEFAULT 'Workday',
      main_goal TEXT,
      goal_category VARCHAR(100) DEFAULT 'Study',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT daily_entries_user_date_unique UNIQUE (user_id, entry_date)
    );
  `);

  /* 3. tasks table */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      task_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      daily_entry_id INTEGER NOT NULL REFERENCES daily_entries(daily_entry_id) ON DELETE CASCADE,
      task_name VARCHAR(255) NOT NULL,
      planned_minutes INTEGER NOT NULL DEFAULT 30,
      actual_minutes INTEGER DEFAULT 0,
      priority VARCHAR(30) NOT NULL DEFAULT 'Medium',
      status VARCHAR(30) NOT NULL DEFAULT 'planned',
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /* 4. activities table */
  await pool.query(`
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
  `);

  /* 5. goals table */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS goals (
      goal_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      goal_name TEXT NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'Study',
      target_minutes INTEGER DEFAULT 120,
      progress_percentage INTEGER DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /* 6. notifications table */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      notification_type VARCHAR(50) NOT NULL DEFAULT 'general',
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /* Safe column migrations for pre-existing tables */
  await pool.query(`
    ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_minutes INTEGER DEFAULT 120;
    ALTER TABLE goals ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;
    ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE goals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_minutes INTEGER DEFAULT 0;
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(30) NOT NULL DEFAULT 'Medium';
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'planned';
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time TIMESTAMP;
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE activities ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'General';
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS activity_type VARCHAR(50) NOT NULL DEFAULT 'productive';
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE goals ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    ALTER TABLE goals ADD COLUMN IF NOT EXISTS title VARCHAR(255);
  `);

  /* Remove any legacy restrictive CHECK constraints on TimeLens tables */
  const checkConstraints = await pool.query(`
    SELECT con.conname AS constraint_name,
           rel.relname AS table_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND con.contype = 'c'
      AND rel.relname IN ('daily_entries', 'tasks', 'activities', 'goals', 'notifications');
  `);

  for (const row of checkConstraints.rows) {
    await pool.query(
      `ALTER TABLE "${row.table_name}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}";`
    );
  }

  /* Performance Indexes */
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date DESC);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_entry ON tasks(user_id, daily_entry_id);
    CREATE INDEX IF NOT EXISTS idx_activities_user_entry ON activities(user_id, daily_entry_id);
    CREATE INDEX IF NOT EXISTS idx_goals_user_active ON goals(user_id, is_active);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
  `);
};

module.exports = {
  initializeDatabase,
};
