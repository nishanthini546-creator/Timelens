const pool = require("../config/db");

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function computeProductivityScore({
  totalTasks,
  completedTasks,
  productiveMinutes,
  digitalMinutes,
  hasActivity,
}) {
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const productivePct =
    digitalMinutes > 0
      ? Math.round((productiveMinutes / digitalMinutes) * 100)
      : completedTasks > 0
      ? 80
      : 0;

  const taskScore = completionRate * 0.45;
  const productiveScore = productivePct * 0.4;
  const activityBonus =
    hasActivity || digitalMinutes > 0 || completedTasks > 0 ? 15 : 0;

  return Math.min(
    100,
    Math.round(taskScore + productiveScore + activityBonus)
  );
}

/* ---------- Helper: Calculate User Streak ---------- */

const calculateUserStreak = async (userId) => {
  const query = `
    SELECT
      TO_CHAR(d.entry_date, 'YYYY-MM-DD') AS date_str,
      (
        SELECT COUNT(*)
        FROM tasks t
        WHERE t.daily_entry_id = d.daily_entry_id
          AND t.status = 'completed'
      ) AS completed_tasks,
      (
        SELECT COALESCE(SUM(a.duration_minutes), 0)
        FROM activities a
        WHERE a.daily_entry_id = d.daily_entry_id
      ) AS activity_minutes,
      (
        SELECT COUNT(*)
        FROM activities a
        WHERE a.daily_entry_id = d.daily_entry_id
      ) AS activity_count
    FROM daily_entries d
    WHERE d.user_id = $1
    ORDER BY d.entry_date DESC
    LIMIT 60;
  `;

  const result = await pool.query(query, [userId]);
  const activeDates = new Set();

  for (const row of result.rows) {
    if (
      Number(row.completed_tasks) > 0 ||
      Number(row.activity_minutes) > 0 ||
      Number(row.activity_count) > 0
    ) {
      activeDates.add(row.date_str);
    }
  }

  let streak = 0;
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - i
    );
    const dStr = `${checkDate.getFullYear()}-${String(
      checkDate.getMonth() + 1
    ).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

    if (activeDates.has(dStr)) {
      streak++;
    } else if (i === 0) {
      // Allow today to still be in progress if yesterday was active
      continue;
    } else {
      break;
    }
  }

  // Build Mon-Sun streakDays for current week
  const todayDayOfWeek = now.getDay(); // 0=Sun..6=Sat
  const mondayOffset = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + mondayOffset
  );

  const weekOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const streakDays = weekOrder.map((label, idx) => {
    const d = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + idx
    );
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      day: label,
      date: dStr,
      active: activeDates.has(dStr),
    };
  });

  return { streak, streakDays };
};

/* ---------- Daily Analytics ---------- */

const getDailyAnalytics = async (userId, dateOrEntryId) => {
  let entryDate = dateOrEntryId;

  // Support passing daily_entry_id (integer) OR YYYY-MM-DD date string
  if (dateOrEntryId && /^\d+$/.test(String(dateOrEntryId).trim())) {
    const lookup = await pool.query(
      `SELECT TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date_str
       FROM daily_entries
       WHERE daily_entry_id = $1 AND user_id = $2`,
      [Number(dateOrEntryId), userId]
    );
    if (lookup.rows[0]?.entry_date_str) {
      entryDate = lookup.rows[0].entry_date_str;
    } else {
      entryDate = new Date().toISOString().split("T")[0];
    }
  } else if (!entryDate || entryDate === "undefined" || entryDate === "null") {
    entryDate = new Date().toISOString().split("T")[0];
  }

  const dailyQuery = `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN activity_type IN ('productive', 'other')
            THEN CASE
              WHEN duration_minutes > 0 THEN duration_minutes
              WHEN end_time IS NULL AND start_time IS NOT NULL
              THEN GREATEST(1, ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) / 60)::INTEGER)
              ELSE 0
            END
            ELSE 0
          END
        ),
        0
      ) AS productive_minutes,

      COALESCE(
        SUM(
          CASE
            WHEN activity_type IN ('recreational', 'recreation')
            THEN CASE
              WHEN duration_minutes > 0 THEN duration_minutes
              WHEN end_time IS NULL AND start_time IS NOT NULL
              THEN GREATEST(1, ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) / 60)::INTEGER)
              ELSE 0
            END
            ELSE 0
          END
        ),
        0
      ) AS recreational_minutes,

      COALESCE(
        SUM(
          CASE
            WHEN duration_minutes > 0 THEN duration_minutes
            WHEN end_time IS NULL AND start_time IS NOT NULL
            THEN GREATEST(1, ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) / 60)::INTEGER)
            ELSE 0
          END
        ),
        0
      ) AS digital_minutes,

      COUNT(*) AS activity_count

    FROM activities
    WHERE user_id = $1
      AND daily_entry_id = (
        SELECT daily_entry_id
        FROM daily_entries
        WHERE user_id = $1
          AND entry_date = $2::date
      );
  `;

  const taskQuery = `
    SELECT
      COUNT(*) AS total_tasks,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
      COALESCE(SUM(planned_minutes), 0) AS planned_minutes,
      COALESCE(SUM(actual_minutes), 0) AS actual_minutes
    FROM tasks
    WHERE user_id = $1
      AND daily_entry_id = (
        SELECT daily_entry_id
        FROM daily_entries
        WHERE user_id = $1
          AND entry_date = $2::date
      );
  `;

  const entryQuery = `
    SELECT *, TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date_str
    FROM daily_entries
    WHERE user_id = $1
      AND entry_date = $2::date;
  `;

  const [dailyResult, taskResult, entryResult, streakInfo] = await Promise.all([
    pool.query(dailyQuery, [userId, entryDate]),
    pool.query(taskQuery, [userId, entryDate]),
    pool.query(entryQuery, [userId, entryDate]),
    calculateUserStreak(userId),
  ]);

  const activity = dailyResult.rows[0] || {};
  const tasks = taskResult.rows[0] || {};
  const entry = entryResult.rows[0] || null;

  const totalTasks = Number(tasks.total_tasks || 0);
  const completedTasks = Number(tasks.completed_tasks || 0);
  const plannedMinutes = Number(tasks.planned_minutes || 0);
  const actualTaskMinutes = Number(tasks.actual_minutes || 0);

  const actProductive = Number(activity.productive_minutes || 0);
  const actRecreational = Number(activity.recreational_minutes || 0);
  const actDigital = Number(activity.digital_minutes || 0);

  // Combine tracked activity time with completed task actual minutes if no separate activity was started
  const productiveMinutes =
    actProductive > 0 ? actProductive : actualTaskMinutes;
  const recreationalMinutes = actRecreational;
  const digitalMinutes =
    actDigital > 0 ? actDigital : productiveMinutes + recreationalMinutes;
  const actualMinutes =
    actualTaskMinutes > 0 ? actualTaskMinutes : digitalMinutes;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const productivityPercentage =
    digitalMinutes > 0
      ? Math.round((productiveMinutes / digitalMinutes) * 100)
      : completionRate;

  const productivityScore = computeProductivityScore({
    totalTasks,
    completedTasks,
    productiveMinutes,
    digitalMinutes,
    hasActivity: Number(activity.activity_count || 0) > 0,
  });

  return {
    date: entryDate,
    dayType: entry?.day_type || "Workday",
    mainGoal: entry?.main_goal || "",
    goalCategory: entry?.goal_category || "Study",
    digitalMinutes,
    digital_minutes: digitalMinutes,
    productiveMinutes,
    productive_minutes: productiveMinutes,
    productiveTime: productiveMinutes,
    recreationalMinutes,
    recreational_minutes: recreationalMinutes,
    recreationMinutes: recreationalMinutes,
    recreationTime: recreationalMinutes,
    totalTasks,
    total_tasks: totalTasks,
    completedTasks,
    completed_tasks: completedTasks,
    plannedMinutes,
    planned_minutes: plannedMinutes,
    actualMinutes,
    actual_minutes: actualMinutes,
    completionRate,
    productivity_percentage: productivityPercentage,
    productivityScore,
    score: productivityScore,
    streak: streakInfo.streak,
    streakDays: streakInfo.streakDays,
  };
};

/* ---------- Weekly Analytics ---------- */

const getWeeklyAnalytics = async (userId, startDate, endDate) => {
  const query = `
    SELECT
      TO_CHAR(d.entry_date, 'YYYY-MM-DD') AS entry_date_str,
      d.day_type,
      d.main_goal,
      d.goal_category,

      COALESCE(
        (
          SELECT SUM(a.duration_minutes)
          FROM activities a
          WHERE a.user_id = d.user_id
            AND a.daily_entry_id = d.daily_entry_id
        ),
        0
      ) AS digital_minutes,

      COALESCE(
        (
          SELECT SUM(a.duration_minutes)
          FROM activities a
          WHERE a.user_id = d.user_id
            AND a.daily_entry_id = d.daily_entry_id
            AND a.activity_type IN ('productive', 'other')
        ),
        0
      ) AS productive_minutes,

      COALESCE(
        (
          SELECT SUM(a.duration_minutes)
          FROM activities a
          WHERE a.user_id = d.user_id
            AND a.daily_entry_id = d.daily_entry_id
            AND a.activity_type IN ('recreational', 'recreation')
        ),
        0
      ) AS recreational_minutes,

      (
        SELECT COUNT(*)
        FROM tasks t
        WHERE t.user_id = d.user_id
          AND t.daily_entry_id = d.daily_entry_id
      ) AS total_tasks,

      (
        SELECT COUNT(*)
        FROM tasks t
        WHERE t.user_id = d.user_id
          AND t.daily_entry_id = d.daily_entry_id
          AND t.status = 'completed'
      ) AS completed_tasks,

      COALESCE(
        (
          SELECT SUM(t.planned_minutes)
          FROM tasks t
          WHERE t.user_id = d.user_id
            AND t.daily_entry_id = d.daily_entry_id
        ),
        0
      ) AS planned_minutes,

      COALESCE(
        (
          SELECT SUM(t.actual_minutes)
          FROM tasks t
          WHERE t.user_id = d.user_id
            AND t.daily_entry_id = d.daily_entry_id
        ),
        0
      ) AS actual_minutes

    FROM daily_entries d
    WHERE d.user_id = $1
      AND d.entry_date BETWEEN $2::date AND $3::date
    ORDER BY d.entry_date ASC;
  `;

  const result = await pool.query(query, [userId, startDate, endDate]);

  const byDate = new Map();
  for (const row of result.rows) {
    const totalTasks = Number(row.total_tasks || 0);
    const completedTasks = Number(row.completed_tasks || 0);
    const plannedMinutes = Number(row.planned_minutes || 0);
    const actualMinutes = Number(row.actual_minutes || 0);
    const actProd = Number(row.productive_minutes || 0);
    const actRec = Number(row.recreational_minutes || 0);
    const actDig = Number(row.digital_minutes || 0);

    const productiveMinutes = actProd > 0 ? actProd : actualMinutes;
    const recreationalMinutes = actRec;
    const digitalMinutes =
      actDig > 0 ? actDig : productiveMinutes + recreationalMinutes;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const productivityScore = computeProductivityScore({
      totalTasks,
      completedTasks,
      productiveMinutes,
      digitalMinutes,
      hasActivity: digitalMinutes > 0 || completedTasks > 0,
    });

    byDate.set(row.entry_date_str, {
      date: row.entry_date_str,
      dayType: row.day_type,
      mainGoal: row.main_goal,
      goalCategory: row.goal_category,
      digitalMinutes,
      digital_minutes: digitalMinutes,
      digital: digitalMinutes,
      productiveMinutes,
      productive_minutes: productiveMinutes,
      productive: productiveMinutes,
      recreationalMinutes,
      recreational_minutes: recreationalMinutes,
      recreational: recreationalMinutes,
      totalTasks,
      completedTasks,
      plannedMinutes,
      actualMinutes,
      completionRate,
      productivityScore,
    });
  }

  // Build full 7-day timeline between startDate and endDate
  const days = [];
  const startParts = startDate.split("-").map(Number);
  const startObj = new Date(startParts[0], startParts[1] - 1, startParts[2]);

  for (let i = 0; i < 7; i++) {
    const cur = new Date(
      startObj.getFullYear(),
      startObj.getMonth(),
      startObj.getDate() + i
    );
    const dStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(cur.getDate()).padStart(2, "0")}`;
    const shortDay = SHORT_DAYS[cur.getDay()];

    if (byDate.has(dStr)) {
      days.push({
        ...byDate.get(dStr),
        day: shortDay,
      });
    } else {
      days.push({
        date: dStr,
        day: shortDay,
        dayType: "Workday",
        mainGoal: "",
        goalCategory: "Study",
        digitalMinutes: 0,
        digital_minutes: 0,
        digital: 0,
        productiveMinutes: 0,
        productive_minutes: 0,
        productive: 0,
        recreationalMinutes: 0,
        recreational_minutes: 0,
        recreational: 0,
        totalTasks: 0,
        completedTasks: 0,
        plannedMinutes: 0,
        actualMinutes: 0,
        completionRate: 0,
        productivityScore: 0,
      });
    }
  }

  const totals = days.reduce(
    (acc, day) => ({
      digitalMinutes: acc.digitalMinutes + day.digitalMinutes,
      productiveMinutes: acc.productiveMinutes + day.productiveMinutes,
      recreationalMinutes: acc.recreationalMinutes + day.recreationalMinutes,
      totalTasks: acc.totalTasks + day.totalTasks,
      completedTasks: acc.completedTasks + day.completedTasks,
      plannedMinutes: acc.plannedMinutes + day.plannedMinutes,
      actualMinutes: acc.actualMinutes + day.actualMinutes,
    }),
    {
      digitalMinutes: 0,
      productiveMinutes: 0,
      recreationalMinutes: 0,
      totalTasks: 0,
      completedTasks: 0,
      plannedMinutes: 0,
      actualMinutes: 0,
    }
  );

  const completionRate =
    totals.totalTasks > 0
      ? Math.round((totals.completedTasks / totals.totalTasks) * 100)
      : 0;

  const streakInfo = await calculateUserStreak(userId);

  return {
    startDate,
    endDate,
    days,
    ...totals,
    completionRate,
    streak: streakInfo.streak,
    streakDays: streakInfo.streakDays,
    totals: {
      ...totals,
      completionRate,
    },
  };
};

/* ---------- Monthly Calendar Analytics ---------- */

const getMonthlyAnalytics = async (userId, year, month) => {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
    lastDay
  ).padStart(2, "0")}`;

  const query = `
    SELECT
      TO_CHAR(d.entry_date, 'YYYY-MM-DD') AS entry_date_str,
      d.day_type,
      d.main_goal,
      d.goal_category,

      COALESCE(
        (
          SELECT SUM(a.duration_minutes)
          FROM activities a
          WHERE a.user_id = d.user_id
            AND a.daily_entry_id = d.daily_entry_id
        ),
        0
      ) AS digital_minutes,

      COALESCE(
        (
          SELECT SUM(a.duration_minutes)
          FROM activities a
          WHERE a.user_id = d.user_id
            AND a.daily_entry_id = d.daily_entry_id
            AND a.activity_type IN ('productive', 'other')
        ),
        0
      ) AS productive_minutes,

      (
        SELECT COUNT(*)
        FROM tasks t
        WHERE t.user_id = d.user_id
          AND t.daily_entry_id = d.daily_entry_id
      ) AS total_tasks,

      (
        SELECT COUNT(*)
        FROM tasks t
        WHERE t.user_id = d.user_id
          AND t.daily_entry_id = d.daily_entry_id
          AND t.status = 'completed'
      ) AS completed_tasks,

      COALESCE(
        (
          SELECT SUM(t.actual_minutes)
          FROM tasks t
          WHERE t.user_id = d.user_id
            AND t.daily_entry_id = d.daily_entry_id
        ),
        0
      ) AS actual_minutes

    FROM daily_entries d
    WHERE d.user_id = $1
      AND d.entry_date BETWEEN $2::date AND $3::date
    ORDER BY d.entry_date ASC;
  `;

  const [result, streakInfo] = await Promise.all([
    pool.query(query, [userId, startDate, endDate]),
    calculateUserStreak(userId),
  ]);

  const calendarMap = {};

  for (const row of result.rows) {
    const tasks = Number(row.total_tasks || 0);
    const completed = Number(row.completed_tasks || 0);
    const actProd = Number(row.productive_minutes || 0);
    const actualMinutes = Number(row.actual_minutes || 0);
    const productiveMinutes = actProd > 0 ? actProd : actualMinutes;
    const digitalMinutes = Math.max(
      Number(row.digital_minutes || 0),
      productiveMinutes
    );

    if (tasks > 0 || productiveMinutes > 0 || digitalMinutes > 0) {
      const productivity = computeProductivityScore({
        totalTasks: tasks,
        completedTasks: completed,
        productiveMinutes,
        digitalMinutes,
        hasActivity: true,
      });

      calendarMap[row.entry_date_str] = {
        productivity,
        tasks,
        completed,
        productiveMinutes,
        digitalMinutes,
        mainGoal: row.main_goal || "",
        dayType: row.day_type || "Workday",
      };
    }
  }

  return {
    year,
    month,
    days: calendarMap,
    streak: streakInfo.streak,
    streakDays: streakInfo.streakDays,
  };
};

module.exports = {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  calculateUserStreak,
};