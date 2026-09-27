const pool = require("../config/db");

function formatEntryRow(row) {
  if (!row) return null;

  let dateStr = row.entry_date_str;
  if (!dateStr && row.entry_date) {
    if (typeof row.entry_date === "string") {
      dateStr = row.entry_date.split("T")[0];
    } else if (row.entry_date instanceof Date) {
      const y = row.entry_date.getFullYear();
      const m = String(row.entry_date.getMonth() + 1).padStart(2, "0");
      const d = String(row.entry_date.getDate()).padStart(2, "0");
      dateStr = `${y}-${m}-${d}`;
    }
  }

  return {
    daily_entry_id: row.daily_entry_id,
    id: row.daily_entry_id,
    _id: row.daily_entry_id,
    user_id: row.user_id,
    userId: row.user_id,
    entry_date: dateStr,
    entryDate: dateStr,
    date: dateStr,
    day_type: row.day_type || "Workday",
    dayType: row.day_type || "Workday",
    main_goal: row.main_goal || "",
    mainGoal: row.main_goal || "",
    goal: row.main_goal || "",
    goal_category: row.goal_category || "Study",
    goalCategory: row.goal_category || "Study",
    category: row.goal_category || "Study",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/* ---------- Create or Update (Upsert) Daily Entry ---------- */

const createDailyEntry = async ({
  userId,
  entryDate,
  dayType,
  mainGoal,
  goalCategory,
}) => {
  const query = `
    INSERT INTO daily_entries
      (user_id, entry_date, day_type, main_goal, goal_category, updated_at)
    VALUES
      ($1, $2::date, $3, $4, $5, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, entry_date)
    DO UPDATE SET
      day_type = COALESCE(EXCLUDED.day_type, daily_entries.day_type),
      main_goal = CASE
        WHEN EXCLUDED.main_goal IS NOT NULL AND EXCLUDED.main_goal <> ''
        THEN EXCLUDED.main_goal
        ELSE daily_entries.main_goal
      END,
      goal_category = COALESCE(EXCLUDED.goal_category, daily_entries.goal_category),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *, TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date_str;
  `;

  const result = await pool.query(query, [
    userId,
    entryDate,
    dayType || "Workday",
    mainGoal !== undefined ? mainGoal : null,
    goalCategory || "Study",
  ]);

  return formatEntryRow(result.rows[0]);
};

/* ---------- Explicitly Update Daily Entry ---------- */

const updateDailyEntry = async ({
  userId,
  entryDate,
  dayType,
  mainGoal,
  goalCategory,
}) => {
  const query = `
    INSERT INTO daily_entries
      (user_id, entry_date, day_type, main_goal, goal_category, updated_at)
    VALUES
      ($1, $2::date, $3, $4, $5, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, entry_date)
    DO UPDATE SET
      day_type = EXCLUDED.day_type,
      main_goal = EXCLUDED.main_goal,
      goal_category = EXCLUDED.goal_category,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *, TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date_str;
  `;

  const result = await pool.query(query, [
    userId,
    entryDate,
    dayType || "Workday",
    mainGoal !== undefined ? mainGoal : null,
    goalCategory || "Study",
  ]);

  return formatEntryRow(result.rows[0]);
};

/* ---------- Get Daily Entry By Date ---------- */

const getDailyEntryByDate = async (userId, entryDate) => {
  const query = `
    SELECT *, TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date_str
    FROM daily_entries
    WHERE user_id = $1
      AND entry_date = $2::date;
  `;

  const result = await pool.query(query, [userId, entryDate]);

  return formatEntryRow(result.rows[0]);
};

/* ---------- Get Latest Daily Entry ---------- */

const getLatestDailyEntry = async (userId) => {
  const query = `
    SELECT *, TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date_str
    FROM daily_entries
    WHERE user_id = $1
    ORDER BY entry_date DESC
    LIMIT 1;
  `;

  const result = await pool.query(query, [userId]);

  return formatEntryRow(result.rows[0]);
};

module.exports = {
  createDailyEntry,
  updateDailyEntry,
  getDailyEntryByDate,
  getLatestDailyEntry,
  formatEntryRow,
};