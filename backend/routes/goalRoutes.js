const express = require("express");

const {
  create,
  getAll,
  remove,
} = require("../controllers/goalController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


/* ---------- Create Goal ---------- */

router.post(
  "/",
  authenticateToken,
  create
);


/* ---------- Get Goals ---------- */

router.get(
  "/",
  authenticateToken,
  getAll
);


/* ---------- Deactivate Goal ---------- */

router.delete(
  "/:goalId",
  authenticateToken,
  remove
);


module.exports = router;