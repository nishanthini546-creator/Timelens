const express = require("express");

const {
  create,
  getAll,
  start,
  complete,
} = require("../controllers/taskcontroller");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


/* ---------- Create Task ---------- */

router.post(
  "/",
  authenticateToken,
  create
);


/* ---------- Get Tasks ---------- */

router.get(
  "/:dailyEntryId",
  authenticateToken,
  getAll
);


/* ---------- Start Task ---------- */

router.post(
  "/:taskId/start",
  authenticateToken,
  start
);


/* ---------- Complete Task ---------- */

router.post(
  "/:taskId/complete",
  authenticateToken,
  complete
);


module.exports = router;