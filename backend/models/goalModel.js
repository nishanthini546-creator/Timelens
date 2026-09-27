const pool = require("../config/db");

function formatGoalRow(row) {
  if (!row) return null;
  return {
    goal_id: row.goal_id,
    id: row.goal_id,
    _id: row.goal_id,
    user_id: row.user_id,
    goal_name: row.goal_name,
    goalName: row.goal_name,
    name: row.goal_name,
    category: row.category || "Study",
    target_minutes: Number(row.target_minutes || 120),
    progress_percentage: Number(row.progress_percentage || 0),
    is_active: row.is_active !== false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/* ---------- Create Goal ---------- */

const createGoal = async ({ userId, goalName, category }) => {
  const query = `
    INSERT INTO goals
      (user_id, goal_name, category, is_active)
    VALUES
      ($1, $2, $3, TRUE)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    goalName,
    category || "Study",
  ]);

  return formatGoalRow(result.rows[0]);
};

/* ---------- Get Active Goals ---------- */

const getActiveGoals = async (userId) => {
  const query = `
    SELECT *
    FROM goals
    WHERE user_id = $1
      AND is_active = TRUE
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows.map(formatGoalRow);
};

/* ---------- Deactivate Goal ---------- */

const deactivateGoal = async (userId, goalId) => {
  const query = `
    UPDATE goals
    SET
      is_active = FALSE,
      updated_at = CURRENT_TIMESTAMP
    WHERE goal_id = $1
      AND user_id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [goalId, userId]);

  return formatGoalRow(result.rows[0]);
};

module.exports = {
  createGoal,
  getActiveGoals,
  deactivateGoal,
};