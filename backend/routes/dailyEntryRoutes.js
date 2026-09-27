const express = require("express");

const {
  createEntry,
  updateEntry,
  getEntry,
  getLatestEntry,
} = require("../controllers/dailyEntryController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Create / Upsert Daily Entry ---------- */
router.post("/", authenticateToken, createEntry);

/* ---------- Update Daily Entry ---------- */
router.put("/", authenticateToken, updateEntry);
router.put("/:date", authenticateToken, updateEntry);

/* ---------- Get Latest Entry ---------- */
router.get("/latest", authenticateToken, getLatestEntry);

/* ---------- Get Entry By Date ---------- */
router.get("/:date", authenticateToken, getEntry);

module.exports = router;