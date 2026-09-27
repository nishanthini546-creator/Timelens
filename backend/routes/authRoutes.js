const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
} = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Register ---------- */
router.post("/register", registerUser);

/* ---------- Login ---------- */
router.post("/login", loginUser);

/* ---------- Current User ---------- */
router.get("/me", authenticateToken, getCurrentUser);

/* ---------- Update Profile ---------- */
router.put("/profile", authenticateToken, updateProfile);

module.exports = router;