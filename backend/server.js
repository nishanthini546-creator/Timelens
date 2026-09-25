const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const { createUsersTable } = require("./models/userModel");

const authRoutes = require("./routes/authRoutes");
const dailyEntryRoutes = require("./routes/dailyEntryRoutes");
const taskRoutes = require("./routes/taskRoutes");
const activityRoutes = require("./routes/activityRoutes");

const goalRoutes = require("./routes/goalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");


const app = express();

const PORT = process.env.PORT || 5000;


/* ---------- Middleware ---------- */

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);

app.use(express.json());


/* ---------- API Routes ---------- */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/daily",
  dailyEntryRoutes
);

app.use(
  "/api/tasks",
  taskRoutes
);

app.use(
  "/api/activities",
  activityRoutes
);

app.use(
  "/api/goals",
  goalRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);


/* ---------- Basic Server Route ---------- */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "TimeLens backend is running successfully!",
  });
});


/* ---------- Database Health Check ---------- */

app.get(
  "/api/health",
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT NOW()"
      );

      res.json({
        success: true,
        message:
          "TimeLens API and PostgreSQL are connected.",
        databaseTime:
          result.rows[0].now,
      });

    } catch (error) {
      console.error(
        "Database connection error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Backend is running, but PostgreSQL connection failed.",
      });
    }
  }
);


/* ---------- Start Server ---------- */

const startServer = async () => {
  try {

    await pool.query("SELECT NOW()");

    console.log(
      "PostgreSQL connected successfully."
    );


    await createUsersTable();

    console.log(
      "Users table ready."
    );


    app.listen(
      PORT,
      () => {
        console.log(
          `TimeLens backend running on http://localhost:${PORT}`
        );
      }
    );

  } catch (error) {

    console.error(
      "Failed to start TimeLens backend:",
      error
    );

    process.exit(1);
  }
};


startServer();
