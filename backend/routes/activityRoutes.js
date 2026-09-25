const express = require("express");

const {
  start,
  getAll,
  stop,
} = require("../controllers/activityController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


/* ---------- Start Activity ---------- */

router.post(
  "/start",
  authenticateToken,
  start
);


/* ---------- Get Activities ---------- */

router.get(
  "/:dailyEntryId",
  authenticateToken,
  getAll
);


/* ---------- Stop Activity ---------- */

router.post(
  "/:activityId/stop",
  authenticateToken,
  stop
);


module.exports = router;