const {
  createActivity,
  getActivities,
  stopActivity,
} = require("../models/activityModel");


/* ---------- Start Activity ---------- */

const start = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      dailyEntryId,
      activityName,
      category,
      activityType,
    } = req.body;

    if (
      !dailyEntryId ||
      !activityName ||
      !category ||
      !activityType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Daily entry, activity name, category and activity type are required.",
      });
    }

    const activity = await createActivity({
      userId,
      dailyEntryId,
      activityName: activityName.trim(),
      category,
      activityType,
    });

    res.status(201).json({
      success: true,
      message: "Activity started.",
      activity,
    });

  } catch (error) {
    console.error(
      "Start activity error:",
      error
    );

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

    const {
      dailyEntryId,
    } = req.params;

    if (!dailyEntryId) {
      return res.status(400).json({
        success: false,
        message: "Daily entry ID is required.",
      });
    }

    const activities = await getActivities(
      userId,
      dailyEntryId
    );

    res.json({
      success: true,
      activities,
    });

  } catch (error) {
    console.error(
      "Get activities error:",
      error
    );

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

    const {
      activityId,
    } = req.params;

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required.",
      });
    }

    const activity = await stopActivity(
      userId,
      activityId
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message:
          "Activity not found or has already been stopped.",
      });
    }

    res.json({
      success: true,
      message: "Activity stopped.",
      activity,
    });

  } catch (error) {
    console.error(
      "Stop activity error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to stop activity.",
    });
  }
};


/* ---------- Export ---------- */

module.exports = {
  start,
  getAll,
  stop,
};