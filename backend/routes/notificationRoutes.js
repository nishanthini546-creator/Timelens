const express = require("express");

const {
  create,
  getAll,
  markRead,
} = require("../controllers/notificationController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


router.post(
  "/",
  authenticateToken,
  create
);


router.get(
  "/",
  authenticateToken,
  getAll
);


router.patch(
  "/:notificationId/read",
  authenticateToken,
  markRead
);


module.exports = router;
