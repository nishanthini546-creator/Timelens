const express = require("express");

let taskCtrl;
try {
  taskCtrl = require("../controllers/taskController");
} catch {
  taskCtrl = require("../controllers/taskcontroller");
}

const {
  create,
  getAll,
  start,
  complete,
  remove,
} = taskCtrl;

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Create Task ---------- */
router.post("/", authenticateToken, create);

/* ---------- Get Tasks ---------- */
router.get("/:dailyEntryId", authenticateToken, getAll);

/* ---------- Start Task ---------- */
router.post("/:taskId/start", authenticateToken, start);

/* ---------- Complete Task ---------- */
router.post("/:taskId/complete", authenticateToken, complete);

/* ---------- Delete Task ---------- */
router.delete("/:taskId", authenticateToken, remove);

module.exports = router;