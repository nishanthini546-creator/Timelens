const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const { initializeDatabase } = require("./config/initDb");

const authRoutes = require("./routes/authRoutes");
const dailyEntryRoutes = require("./routes/dailyEntryRoutes");
const taskRoutes = require("./routes/taskRoutes");
const activityRoutes = require("./routes/activityRoutes");
const goalRoutes = require("./routes/goalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/* ---------- Middleware & Production CORS ---------- */

const configuredOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CORS_ORIGIN ||
  process.env.CLIENT_URL ||
  ""
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;

  // Allow localhost in local/dev environments
  if (
    process.env.NODE_ENV !== "production" &&
    (origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:"))
  ) {
    return true;
  }

  // Allow verified HTTPS deployment domains
  try {
    const parsed = new URL(origin);
    if (parsed.protocol === "https:") {
      const host = parsed.hostname;
      if (
        host.endsWith(".trycloudflare.com") ||
        host.endsWith(".onrender.com") ||
        host.endsWith(".vercel.app") ||
        host.endsWith(".railway.app") ||
        host.endsWith(".koyeb.app") ||
        host.endsWith(".hf.space") ||
        host.endsWith(".loca.lt") ||
        host.endsWith(".lhr.life") ||
        host.endsWith(".localhost.run")
      ) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by TimeLens CORS policy"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

/* ---------- API Routes ---------- */

app.use("/api/auth", authRoutes);
app.use("/api/daily", dailyEntryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

/* ---------- API Root & Database Health Check ---------- */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "TimeLens API is running in production mode.",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "TimeLens API and PostgreSQL are connected.",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Backend is running, but PostgreSQL connection failed.",
    });
  }
});

/* ---------- Serve Built Frontend (frontend/dist) ---------- */

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const frontendIndexHtml = path.join(frontendDistPath, "index.html");

if (fs.existsSync(frontendIndexHtml)) {
  app.use(
    express.static(frontendDistPath, {
      maxAge: "1h",
      index: false,
    })
  );

  app.get("/", (req, res) => {
    const accept = req.headers.accept || "";
    if (accept.includes("application/json") && !accept.includes("text/html")) {
      return res.json({
        success: true,
        message: "TimeLens backend is running successfully!",
      });
    }
    return res.sendFile(frontendIndexHtml);
  });

  app.use((req, res, next) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith("/api") &&
      !path.extname(req.path)
    ) {
      return res.sendFile(frontendIndexHtml);
    }
    return next();
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "TimeLens backend is running successfully!",
    });
  });
}

/* ---------- Production-Safe Error Handler ---------- */

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.message && err.message.includes("CORS") ? 403 : 500;
  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 403
        ? "CORS policy prevented this request."
        : "An unexpected server error occurred.",
  });
});

/* ---------- Start Server ---------- */

const http = require("http");

const startServer = async () => {
  try {
    await initializeDatabase();

    console.log(
      "PostgreSQL connected and all TimeLens tables initialized."
    );

    const server = http.createServer(app);

    server.on("error", (err) => {
      console.error("HTTP server error:", err);
      process.exit(1);
    });

    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`TimeLens server running on port ${PORT}`);
    });

    // Keep event loop active when running as a background daemon with closed stdin
    setInterval(() => {}, 1 << 30);
  } catch (error) {
    console.error("Failed to start TimeLens backend:", error.message);
    process.exit(1);
  }
};

startServer();