const {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
} = require("../models/analyticsModel");

/* ---------- Today's Analytics ---------- */

const getToday = async (req, res) => {
  try {
    const userId = req.user.userId;

    const rawDate = req.query.date;
    const date =
      rawDate && rawDate !== "undefined" && rawDate !== "null"
        ? rawDate
        : new Date().toISOString().split("T")[0];

    const analytics = await getDailyAnalytics(userId, date);

    res.json({
      success: true,
      analytics,
      data: analytics,
      ...analytics,
    });
  } catch (error) {
    console.error("Daily analytics error:", error);

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

    const rawEndDate = req.query.endDate;
    const endDate =
      rawEndDate &&
      rawEndDate !== "undefined" &&
      rawEndDate !== "null" &&
      !Number.isNaN(new Date(rawEndDate).getTime())
        ? rawEndDate
        : new Date().toISOString().split("T")[0];

    const endParts = endDate.split("-").map(Number);
    const endObj = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    const startObj = new Date(
      endObj.getFullYear(),
      endObj.getMonth(),
      endObj.getDate() - 6
    );

    const startDate = `${startObj.getFullYear()}-${String(
      startObj.getMonth() + 1
    ).padStart(2, "0")}-${String(startObj.getDate()).padStart(2, "0")}`;

    const analytics = await getWeeklyAnalytics(userId, startDate, endDate);

    res.json({
      success: true,
      analytics,
      data: analytics.days,
      days: analytics.days,
      totals: analytics.totals,
    });
  } catch (error) {
    console.error("Weekly analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to calculate weekly analytics.",
    });
  }
};

/* ---------- Monthly Calendar Analytics ---------- */

const getMonth = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;

    const analytics = await getMonthlyAnalytics(userId, year, month);

    res.json({
      success: true,
      analytics,
      data: analytics,
      days: analytics.days,
    });
  } catch (error) {
    console.error("Monthly analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to calculate monthly analytics.",
    });
  }
};

module.exports = {
  getToday,
  getWeek,
  getMonth,
};