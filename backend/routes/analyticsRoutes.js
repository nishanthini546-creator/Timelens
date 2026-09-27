const express = require("express");

const {
  getToday,
  getWeek,
  getMonth,
} = require("../controllers/analyticsController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/today", authenticateToken, getToday);
router.get("/week", authenticateToken, getWeek);
router.get("/month", authenticateToken, getMonth);

module.exports = router;