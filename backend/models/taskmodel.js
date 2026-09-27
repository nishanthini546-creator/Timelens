const pool = require("../config/db");

function formatTaskRow(row) {
  if (!row) return null;
  const status = row.status || "planned";
  const isCompleted = status === "completed";
  const isRunning = status === "in_progress" || status === "running";

  return {
    task_id: row.task_id,
    id: row.task_id,
    _id: row.task_id,
    user_id: row.user_id,
    userId: row.user_id,
    daily_entry_id: row.daily_entry_id,
    dailyEntryId: row.daily_entry_id,
    task_name: row.task_name,
    taskName: row.task_name,
    name: row.task_name,
    title: row.task_name,
    planned_minutes: Number(row.planned_minutes || 0),
    plannedMinutes: Number(row.planned_minutes || 0),
    minutes: Number(row.planned_minutes || 0),
    duration_minutes: Number(row.planned_minutes || 0),
    duration: Number(row.planned_minutes || 0),
    actual_minutes: Number(row.actual_minutes || 0),
    actualMinutes: Number(row.actual_minutes || 0),
    priority: row.priority || "Medium",
    status,
    completed: isCompleted,
    started: isRunning,
    running: isRunning,
    start_time: row.start_time,
    end_time: row.end_time,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

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
        priority,
        status
      )
    VALUES
      ($1, $2, $3, $4, $5, 'planned')
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    dailyEntryId,
    taskName,
    plannedMinutes,
    priority || "Medium",
  ]);

  return formatTaskRow(result.rows[0]);
};

/* ---------- Get Tasks ---------- */

const getTasks = async (userId, dailyEntryId) => {
  const query = `
    SELECT *
    FROM tasks
    WHERE user_id = $1
      AND daily_entry_id = $2
    ORDER BY created_at ASC, task_id ASC;
  `;

  const result = await pool.query(query, [userId, dailyEntryId]);

  return result.rows.map(formatTaskRow);
};

/* ---------- Start Task ---------- */

const startTask = async (userId, taskId) => {
  const query = `
    UPDATE tasks
    SET
      status = 'in_progress',
      start_time = COALESCE(start_time, CURRENT_TIMESTAMP),
      updated_at = CURRENT_TIMESTAMP
    WHERE task_id = $1
      AND user_id = $2
      AND status <> 'completed'
    RETURNING *;
  `;

  const result = await pool.query(query, [taskId, userId]);

  return formatTaskRow(result.rows[0]);
};

/* ---------- Complete Task ---------- */

const completeTask = async (userId, taskId, focusMinutes = null) => {
  const query = `
    UPDATE tasks
    SET
      status = 'completed',
      end_time = CURRENT_TIMESTAMP,
      actual_minutes =
        CASE
          WHEN $3::INTEGER IS NOT NULL AND $3::INTEGER > 0
          THEN $3::INTEGER
          WHEN start_time IS NOT NULL
          THEN GREATEST(
            1,
            ROUND(
              EXTRACT(
                EPOCH FROM (
                  CURRENT_TIMESTAMP - start_time
                )
              ) / 60
            )::INTEGER
          )
          ELSE planned_minutes
        END,
      updated_at = CURRENT_TIMESTAMP
    WHERE task_id = $1
      AND user_id = $2
      AND status <> 'completed'
    RETURNING *;
  `;

  const result = await pool.query(query, [
    taskId,
    userId,
    focusMinutes ? Number(focusMinutes) : null,
  ]);

  return formatTaskRow(result.rows[0]);
};

/* ---------- Delete Task ---------- */

const deleteTask = async (userId, taskId) => {
  const query = `
    DELETE FROM tasks
    WHERE task_id = $1
      AND user_id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [taskId, userId]);
  return formatTaskRow(result.rows[0]);
};

module.exports = {
  createTask,
  getTasks,
  startTask,
  completeTask,
  deleteTask,
  formatTaskRow,
};