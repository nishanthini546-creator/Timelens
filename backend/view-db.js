const pool = require("./config/db");

async function viewDatabase() {
  try {
    console.log("=============================================================");
    console.log("          TIMELENS — LIVE POSTGRESQL DATABASE VIEWER         ");
    console.log("=============================================================\n");

    const tables = [
      {
        name: "users",
        query: "SELECT user_id, name, email, created_at FROM users ORDER BY user_id ASC",
      },
      {
        name: "daily_entries",
        query:
          "SELECT daily_entry_id, user_id, TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date, day_type, main_goal, goal_category FROM daily_entries ORDER BY daily_entry_id ASC",
      },
      {
        name: "tasks",
        query:
          "SELECT task_id, user_id, daily_entry_id, task_name, planned_minutes, actual_minutes, status FROM tasks ORDER BY task_id ASC",
      },
      {
        name: "activities",
        query:
          "SELECT activity_id, user_id, daily_entry_id, activity_name, category, activity_type, duration_minutes FROM activities ORDER BY activity_id ASC",
      },
      {
        name: "goals",
        query:
          "SELECT goal_id, user_id, goal_name, category, status, is_active FROM goals ORDER BY goal_id ASC",
      },
      {
        name: "notifications",
        query:
          "SELECT notification_id, user_id, notification_type, message, is_read, created_at FROM notifications ORDER BY notification_id ASC",
      },
    ];

    for (const table of tables) {
      const result = await pool.query(table.query);
      console.log(`▶ TABLE: ${table.name.toUpperCase()} (${result.rows.length} rows)`);
      if (result.rows.length === 0) {
        console.log("   (Empty — 0 rows currently saved)\n");
      } else {
        console.table(result.rows);
        console.log("");
      }
    }
  } catch (err) {
    console.error("Error reading PostgreSQL database:", err.message);
  } finally {
    await pool.end();
  }
}

viewDatabase();
