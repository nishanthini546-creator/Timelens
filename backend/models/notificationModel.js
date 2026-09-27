const pool = require("../config/db");

function formatNotificationRow(row) {
  if (!row) return null;
  return {
    notification_id: row.notification_id,
    id: row.notification_id,
    _id: row.notification_id,
    user_id: row.user_id,
    notification_type: row.notification_type || "general",
    type: row.notification_type || "general",
    message: row.message,
    is_read: Boolean(row.is_read),
    isRead: Boolean(row.is_read),
    created_at: row.created_at,
  };
}

/* ---------- Create Notification ---------- */

const createNotification = async ({
  userId,
  notificationType,
  message,
}) => {
  const query = `
    INSERT INTO notifications
      (user_id, notification_type, message)
    VALUES
      ($1, $2, $3)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    notificationType || "general",
    message,
  ]);

  return formatNotificationRow(result.rows[0]);
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

  return result.rows.map(formatNotificationRow);
};

/* ---------- Mark Notification Read ---------- */

const markNotificationRead = async (userId, notificationId) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE notification_id = $1
      AND user_id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [notificationId, userId]);

  return formatNotificationRow(result.rows[0]);
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationRead,
};