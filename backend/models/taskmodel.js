const pool = require("../config/db");

/* ---------- Create Task ---------- */

const createTask = async ({
  userId,
  dailyEntryId,
  taskName,
  plannedMinutes,
  priority,
}) => {
  const query = `
    INSERT INTO tasks
      (
        user_id,
        daily_entry_id,
        task_name,
        planned_minutes,
        priority
      )
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    dailyEntryId,
    taskName,
    plannedMinutes,
    priority || "Medium",
  ]);

  return result.rows[0];
};


/* ---------- Get Tasks ---------- */

const getTasks = async (userId, dailyEntryId) => {
  const query = `
    SELECT *
    FROM tasks
    WHERE user_id = $1
      AND daily_entry_id = $2
    ORDER BY created_at ASC;
  `;

  const result = await pool.query(query, [
    userId,
    dailyEntryId,
  ]);

  return result.rows;
};


/* ---------- Start Task ---------- */

const startTask = async (userId, taskId) => {
  const query = `
    UPDATE tasks
    SET
      status = 'in_progress',
      start_time = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE task_id = $1
      AND user_id = $2
      AND status = 'planned'
    RETURNING *;
  `;

  const result = await pool.query(query, [
    taskId,
    userId,
  ]);

  return result.rows[0] || null;
};


/* ---------- Complete Task ---------- */

const completeTask = async (userId, taskId) => {
  const query = `
    UPDATE tasks
    SET
      status = 'completed',
      end_time = CURRENT_TIMESTAMP,
      actual_minutes =
        CASE
          WHEN start_time IS NOT NULL
          THEN ROUND(
            EXTRACT(
              EPOCH FROM (
                CURRENT_TIMESTAMP - start_time
              )
            ) / 60
          )::INTEGER
          ELSE NULL
        END,
      updated_at = CURRENT_TIMESTAMP
    WHERE task_id = $1
      AND user_id = $2
      AND status = 'in_progress'
    RETURNING *;
  `;

  const result = await pool.query(query, [
    taskId,
    userId,
  ]);

  return result.rows[0] || null;
};


/* ---------- Export ---------- */

module.exports = {
  createTask,
  getTasks,
  startTask,
  completeTask,
};