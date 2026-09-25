const {
  getDailyAnalytics,
  getWeeklyAnalytics,
} = require("../models/analyticsModel");


/* ---------- Today's Analytics ---------- */

const getToday = async (req, res) => {
  try {
    const userId = req.user.userId;

    const date =
      req.query.date ||
      new Date().toISOString().split("T")[0];

    const analytics =
      await getDailyAnalytics(
        userId,
        date
      );

    res.json({
      success: true,
      analytics,
    });

  } catch (error) {
    console.error(
      "Daily analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to calculate daily analytics.",
    });
  }
};


/* ---------- Weekly Analytics ---------- */

const getWeek = async (req, res) => {
  try {
    const userId = req.user.userId;

    const endDate =
      req.query.endDate ||
      new Date().toISOString().split("T")[0];

    const end = new Date(endDate);

    const start = new Date(end);

    start.setDate(
      start.getDate() - 6
    );

    const startDate =
      start.toISOString().split("T")[0];

    const analytics =
      await getWeeklyAnalytics(
        userId,
        startDate,
        endDate
      );

    res.json({
      success: true,
      analytics,
    });

  } catch (error) {
    console.error(
      "Weekly analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to calculate weekly analytics.",
    });
  }
};


module.exports = {
  getToday,
  getWeek,
};