const {
  createNotification,
  getNotifications,
  markNotificationRead,
} = require("../models/notificationModel");


/* ---------- Create Notification ---------- */

const create = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      notificationType,
      message,
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Notification message is required.",
      });
    }

    const notification =
      await createNotification({
        userId,
        notificationType:
          notificationType || "general",
        message: message.trim(),
      });

    res.status(201).json({
      success: true,
      message: "Notification created.",
      notification,
    });

  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to create notification.",
    });
  }
};


/* ---------- Get Notifications ---------- */

const getAll = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications =
      await getNotifications(userId);

    res.json({
      success: true,
      notifications,
    });

  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to retrieve notifications.",
    });
  }
};


/* ---------- Mark Read ---------- */

const markRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const notification =
      await markNotificationRead(
        userId,
        notificationId
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });

  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
};


module.exports = {
  create,
  getAll,
  markRead,
};