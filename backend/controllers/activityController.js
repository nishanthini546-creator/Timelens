const {
  createActivity,
  getActivities,
  stopActivity,
  deleteActivity,
} = require("../models/activityModel");

/* ---------- Start Activity ---------- */

const start = async (req, res) => {
  try {
    const userId = req.user.userId;

    const dailyEntryId =
      req.body.dailyEntryId ||
      req.body.daily_entry_id ||
      req.body.entryId;

    const activityName =
      req.body.activityName ||
      req.body.name ||
      req.body.title;

    const category =
      req.body.category ||
      (req.body.type === "recreation" || req.body.type === "recreational"
        ? "Recreation"
        : "Focus");

    const activityType =
      req.body.activityType ||
      req.body.type ||
      "productive";

    if (!dailyEntryId || !activityName) {
      return res.status(400).json({
        success: false,
        message: "Daily entry and activity name are required.",
      });
    }

    const activity = await createActivity({
      userId,
      dailyEntryId: Number(dailyEntryId),
      activityName: String(activityName).trim(),
      category,
      activityType,
    });

    res.status(201).json({
      success: true,
      message: "Activity started.",
      activity,
      data: activity,
    });
  } catch (error) {
    console.error("Start activity error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to start activity.",
    });
  }
};

/* ---------- Get Activities ---------- */

const getAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dailyEntryId } = req.params;

    if (!dailyEntryId) {
      return res.status(400).json({
        success: false,
        message: "Daily entry ID is required.",
      });
    }

    const activities = await getActivities(userId, Number(dailyEntryId));

    res.json({
      success: true,
      activities,
      data: activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve activities.",
    });
  }
};

/* ---------- Stop Activity ---------- */

const stop = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { activityId } = req.params;
    const explicitDuration = req.body?.durationMinutes || req.body?.duration || null;

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required.",
      });
    }

    const activity = await stopActivity(
      userId,
      Number(activityId),
      explicitDuration
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found or has already been stopped.",
      });
    }

    res.json({
      success: true,
      message: "Activity stopped.",
      activity,
      data: activity,
    });
  } catch (error) {
    console.error("Stop activity error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to stop activity.",
    });
  }
};

/* ---------- Delete Activity ---------- */

const remove = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { activityId } = req.params;

    const deleted = await deleteActivity(userId, Number(activityId));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    res.json({
      success: true,
      message: "Activity removed.",
      activity: deleted,
    });
  } catch (error) {
    console.error("Delete activity error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete activity.",
    });
  }
};

module.exports = {
  start,
  getAll,
  stop,
  remove,
};