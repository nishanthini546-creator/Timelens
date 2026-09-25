const pool = require("../config/db");


/* ---------- Create Goal ---------- */

const createGoal = async ({
  userId,
  goalName,
  category,
}) => {
  const query = `
    INSERT INTO goals
      (
        user_id,
        goal_name,
        category
      )
    VALUES
      ($1, $2, $3)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    goalName,
    category,
  ]);

  return result.rows[0];
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

  return result.rows;
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

  const result = await pool.query(query, [
    goalId,
    userId,
  ]);

  return result.rows[0] || null;
};


module.exports = {
  createGoal,
  getActiveGoals,
  deactivateGoal,
};