const pool = require("../config/db");

/* ---------- Create Daily Entry ---------- */

const createDailyEntry = async ({
  userId,
  entryDate,
  dayType,
  mainGoal,
  goalCategory,
}) => {
  const query = `
    INSERT INTO daily_entries
      (user_id, entry_date, day_type, main_goal, goal_category)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    entryDate,
    dayType,
    mainGoal || null,
    goalCategory || null,
  ]);

  return result.rows[0];
};


/* ---------- Get Daily Entry By Date ---------- */

const getDailyEntryByDate = async (
  userId,
  entryDate
) => {
  const query = `
    SELECT *
    FROM daily_entries
    WHERE user_id = $1
      AND entry_date = $2;
  `;

  const result = await pool.query(query, [
    userId,
    entryDate,
  ]);

  return result.rows[0] || null;
};


/* ---------- Get Latest Daily Entry ---------- */

const getLatestDailyEntry = async (userId) => {
  const query = `
    SELECT *
    FROM daily_entries
    WHERE user_id = $1
    ORDER BY entry_date DESC
    LIMIT 1;
  `;

  const result = await pool.query(query, [
    userId,
  ]);

  return result.rows[0] || null;
};


module.exports = {
  createDailyEntry,
  getDailyEntryByDate,
  getLatestDailyEntry,
};