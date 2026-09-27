const pool = require("../config/db");

function formatActivityRow(row) {
  if (!row) return null;

  const rawType = String(row.activity_type || "productive").toLowerCase();
  const normalizedType =
    rawType === "recreation" || rawType === "recreational"
      ? "recreational"
      : rawType === "other"
      ? "other"
      : "productive";

  const isRunning = row.end_time === null;
  let durationMinutes = Number(row.duration_minutes || 0);

  if (isRunning && row.start_time) {
    const elapsedMs = Date.now() - new Date(row.start_time).getTime();
    durationMinutes = Math.max(1, Math.round(elapsedMs / 60000));
  }

  return {
    activity_id: row.activity_id,
    id: row.activity_id,
    _id: row.activity_id,
    user_id: row.user_id,
    userId: row.user_id,
    daily_entry_id: row.daily_entry_id,
    dailyEntryId: row.daily_entry_id,
    activity_name: row.activity_name,
    activityName: row.activity_name,
    name: row.activity_name,
    category: row.category || "General",
    activity_type: normalizedType,
    activityType: normalizedType,
    type: normalizedType,
    start_time: row.start_time,
    end_time: row.end_time,
    duration_minutes: durationMinutes,
    durationMinutes,
    duration: durationMinutes,
    active: isRunning,
    status: isRunning ? "running" : "completed",
    created_at: row.created_at,
  };
}

/* ---------- Create Activity ---------- */

const createActivity = async ({
  userId,
  dailyEntryId,
  activityName,
  category,
  activityType,
}) => {
  const rawType = String(activityType || "productive").toLowerCase();
  const normalizedType =
    rawType === "recreation" || rawType === "recreational"
      ? "recreational"
      : rawType === "other"
      ? "other"
      : "productive";

  const query = `
    INSERT INTO activities
      (
        user_id,
        daily_entry_id,
        activity_name,
        category,
        activity_type,
        start_time
      )
    VALUES
      ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    dailyEntryId,
    activityName,
    category || "General",
    normalizedType,
  ]);

  return formatActivityRow(result.rows[0]);
};

/* ---------- Get Activities ---------- */

const getActivities = async (userId, dailyEntryId) => {
  const query = `
    SELECT *
    FROM activities
    WHERE user_id = $1
      AND daily_entry_id = $2
    ORDER BY created_at ASC, activity_id ASC;
  `;

  const result = await pool.query(query, [userId, dailyEntryId]);

  return result.rows.map(formatActivityRow);
};

/* ---------- Stop Activity ---------- */

const stopActivity = async (userId, activityId, explicitDuration = null) => {
  const query = `
    UPDATE activities
    SET
      end_time = CURRENT_TIMESTAMP,
      duration_minutes =
        CASE
          WHEN $3::INTEGER IS NOT NULL AND $3::INTEGER > 0
          THEN $3::INTEGER
          ELSE GREATEST(
            1,
            ROUND(
              EXTRACT(
                EPOCH FROM (
                  CURRENT_TIMESTAMP - start_time
                )
              ) / 60
            )::INTEGER
          )
        END,
      updated_at = CURRENT_TIMESTAMP
    WHERE activity_id = $1
      AND user_id = $2
      AND end_time IS NULL
    RETURNING *;
  `;

  const result = await pool.query(query, [
    activityId,
    userId,
    explicitDuration ? Number(explicitDuration) : null,
  ]);

  return formatActivityRow(result.rows[0]);
};

/* ---------- Delete Activity ---------- */

const deleteActivity = async (userId, activityId) => {
  const query = `
    DELETE FROM activities
    WHERE activity_id = $1
      AND user_id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [activityId, userId]);
  return formatActivityRow(result.rows[0]);
};

module.exports = {
  createActivity,
  getActivities,
  stopActivity,
  deleteActivity,
  formatActivityRow,
};