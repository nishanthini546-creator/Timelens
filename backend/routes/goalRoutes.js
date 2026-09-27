const express = require("express");

const {
  create,
  getAll,
  updateStatus,
  remove,
} = require("../controllers/goalController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Create Goal ---------- */

router.post("/", authenticateToken, create);

/* ---------- Get Goals ---------- */

router.get("/", authenticateToken, getAll);

/* ---------- Update Goal Status ---------- */

router.put("/:goalId/status", authenticateToken, updateStatus);
router.patch("/:goalId/status", authenticateToken, updateStatus);

/* ---------- Deactivate Goal ---------- */

router.delete("/:goalId", authenticateToken, remove);

module.exports = router;