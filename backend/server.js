const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "TimeLens backend is running successfully!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TimeLens backend running on port ${PORT}`);
});