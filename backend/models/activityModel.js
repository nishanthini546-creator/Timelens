const pool = require("../config/db");


/* ---------- Create Activity ---------- */

const createActivity = async ({
  userId,
  dailyEntryId,
  activityName,
  category,
  activityType,
}) => {
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
    category,
    activityType,
  ]);

  return result.rows[0];
};


/* ---------- Get Activities ---------- */

const getActivities = async (
  userId,
  dailyEntryId
) => {
  const query = `
    SELECT *
    FROM activities
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


/* ---------- Stop Activity ---------- */

const stopActivity = async (
  userId,
  activityId
) => {
  const query = `
    UPDATE activities
    SET
      end_time = CURRENT_TIMESTAMP,
      duration_minutes =
        ROUND(
          EXTRACT(
            EPOCH FROM (
              CURRENT_TIMESTAMP - start_time
            )
          ) / 60
        )::INTEGER
    WHERE activity_id = $1
      AND user_id = $2
      AND end_time IS NULL
    RETURNING *;
  `;

  const result = await pool.query(query, [
    activityId,
    userId,
  ]);

  return result.rows[0] || null;
};


/* ---------- Export ---------- */

module.exports = {
  createActivity,
  getActivities,
  stopActivity,
};