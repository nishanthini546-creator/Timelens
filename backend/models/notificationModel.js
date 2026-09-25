const pool = require("../config/db");


/* ---------- Create Notification ---------- */

const createNotification = async ({
  userId,
  notificationType,
  message,
}) => {
  const query = `
    INSERT INTO notifications
      (
        user_id,
        notification_type,
        message
      )
    VALUES
      ($1, $2, $3)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    notificationType,
    message,
  ]);

  return result.rows[0];
};


/* ---------- Get Notifications ---------- */

const getNotifications = async (userId) => {
  const query = `
    SELECT *
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 20;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;
};


/* ---------- Mark Notification Read ---------- */

const markNotificationRead = async (
  userId,
  notificationId
) => {
  const query = `
    UPDATE notifications
    SET
      is_read = TRUE
    WHERE notification_id = $1
      AND user_id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [
    notificationId,
    userId,
  ]);

  return result.rows[0] || null;
};


module.exports = {
  createNotification,
  getNotifications,
  markNotificationRead,
};