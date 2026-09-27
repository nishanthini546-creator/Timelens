const {
  createDailyEntry,
  updateDailyEntry,
  getDailyEntryByDate,
  getLatestDailyEntry,
} = require("../models/dailyEntryModel");
const { createGoal } = require("../models/goalModel");

/* ---------- Create / Save Daily Entry ---------- */

const createEntry = async (req, res) => {
  try {
    const userId = req.user.userId;

    const entryDate =
      req.body.entryDate ||
      req.body.date ||
      new Date().toISOString().split("T")[0];

    const dayType =
      req.body.dayType ||
      req.body.day_type ||
      "Workday";

    const mainGoal =
      req.body.mainGoal !== undefined
        ? req.body.mainGoal
        : req.body.goal !== undefined
        ? req.body.goal
        : req.body.main_goal;

    const goalCategory =
      req.body.goalCategory ||
      req.body.category ||
      req.body.goal_category ||
      "Study";

    if (!entryDate || !dayType) {
      return res.status(400).json({
        success: false,
        message: "Entry date and day type are required.",
      });
    }

    const existingEntry = await getDailyEntryByDate(userId, entryDate);

    let entry;
    if (existingEntry) {
      entry = await updateDailyEntry({
        userId,
        entryDate,
        dayType,
        mainGoal:
          mainGoal !== undefined && mainGoal !== ""
            ? mainGoal
            : existingEntry.main_goal,
        goalCategory: goalCategory || existingEntry.goal_category,
      });
    } else {
      entry = await createDailyEntry({
        userId,
        entryDate,
        dayType,
        mainGoal: mainGoal || "",
        goalCategory,
      });
    }

    // If a non-empty mainGoal was set, also persist/sync in goals table
    if (mainGoal && String(mainGoal).trim()) {
      try {
        await createGoal({
          userId,
          goalName: String(mainGoal).trim(),
          category: goalCategory || "Study",
        });
      } catch (goalErr) {
        // Non-blocking sync
      }
    }

    res.status(existingEntry ? 200 : 201).json({
      success: true,
      message: existingEntry
        ? "Daily plan updated successfully."
        : "Daily entry created successfully.",
      entry,
      data: entry,
      ...entry,
    });
  } catch (error) {
    console.error("Create daily entry error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while saving the daily entry.",
    });
  }
};

/* ---------- Update Daily Entry ---------- */

const updateEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const entryDate =
      req.params.date ||
      req.body.entryDate ||
      req.body.date ||
      new Date().toISOString().split("T")[0];

    const dayType = req.body.dayType || req.body.day_type || "Workday";
    const mainGoal =
      req.body.mainGoal !== undefined
        ? req.body.mainGoal
        : req.body.goal !== undefined
        ? req.body.goal
        : "";
    const goalCategory =
      req.body.goalCategory || req.body.category || "Study";

    const entry = await updateDailyEntry({
      userId,
      entryDate,
      dayType,
      mainGoal,
      goalCategory,
    });

    if (mainGoal && String(mainGoal).trim()) {
      try {
        await createGoal({
          userId,
          goalName: String(mainGoal).trim(),
          category: goalCategory,
        });
      } catch {
        // Ignore
      }
    }

    res.json({
      success: true,
      message: "Daily plan updated successfully.",
      entry,
      data: entry,
      ...entry,
    });
  } catch (error) {
    console.error("Update daily entry error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the daily entry.",
    });
  }
};

/* ---------- Get Daily Entry ---------- */

const getEntry = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required.",
      });
    }

    const entry = await getDailyEntryByDate(userId, date);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "No daily entry found for this date.",
      });
    }

    res.json({
      success: true,
      entry,
      data: entry,
      ...entry,
    });
  } catch (error) {
    console.error("Get daily entry error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving the daily entry.",
    });
  }
};

/* ---------- Get Latest Daily Entry ---------- */

const getLatestEntry = async (req, res) => {
  try {
    const userId = req.user.userId;

    const entry = await getLatestDailyEntry(userId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "No daily entries found for this user.",
      });
    }

    res.json({
      success: true,
      entry,
      data: entry,
      ...entry,
    });
  } catch (error) {
    console.error("Get latest daily entry error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving the latest daily entry.",
    });
  }
};

module.exports = {
  createEntry,
  updateEntry,
  getEntry,
  getLatestEntry,
};