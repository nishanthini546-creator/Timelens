const {
  createDailyEntry,
  getDailyEntryByDate,
  getLatestDailyEntry,
} = require("../models/dailyEntryModel");


/* ---------- Create Daily Entry ---------- */

const createEntry = async (req, res) => {
  try {
    const {
      entryDate,
      dayType,
      mainGoal,
      goalCategory,
    } = req.body;

    const userId = req.user.userId;

    if (!entryDate || !dayType) {
      return res.status(400).json({
        success: false,
        message: "Entry date and day type are required.",
      });
    }

    const existingEntry =
      await getDailyEntryByDate(
        userId,
        entryDate
      );

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message:
          "A daily entry already exists for this date.",
        entry: existingEntry,
      });
    }

    const entry =
      await createDailyEntry({
        userId,
        entryDate,
        dayType,
        mainGoal,
        goalCategory,
      });

    res.status(201).json({
      success: true,
      message:
        "Daily entry created successfully.",
      entry,
    });

  } catch (error) {
    console.error(
      "Create daily entry error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating the daily entry.",
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

    const entry =
      await getDailyEntryByDate(
        userId,
        date
      );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message:
          "No daily entry found for this date.",
      });
    }

    res.json({
      success: true,
      entry,
    });

  } catch (error) {
    console.error(
      "Get daily entry error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while retrieving the daily entry.",
    });
  }
};


/* ---------- Get Latest Daily Entry ---------- */

const getLatestEntry = async (req, res) => {
  try {
    const userId = req.user.userId;

    const entry =
      await getLatestDailyEntry(userId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message:
          "No daily entries found for this user.",
      });
    }

    res.json({
      success: true,
      entry,
    });

  } catch (error) {
    console.error(
      "Get latest daily entry error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while retrieving the latest daily entry.",
    });
  }
};


module.exports = {
  createEntry,
  getEntry,
  getLatestEntry,
};