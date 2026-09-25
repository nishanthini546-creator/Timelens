const express = require("express");

const {
  createEntry,
  getEntry,
  getLatestEntry,
} = require("../controllers/dailyEntryController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


/* ---------- Create Daily Entry ---------- */

router.post(
  "/",
  authenticateToken,
  createEntry
);


/* ---------- Get Latest Entry ---------- */
/*
   IMPORTANT:
   This route must come BEFORE /:date
*/

router.get(
  "/latest",
  authenticateToken,
  getLatestEntry
);


/* ---------- Get Entry By Date ---------- */

router.get(
  "/:date",
  authenticateToken,
  getEntry
);


module.exports = router;