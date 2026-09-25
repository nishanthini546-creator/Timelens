const pool = require("../config/db");


/* ---------- Daily Analytics ---------- */

const getDailyAnalytics = async (
  userId,
  entryDate
) => {

  const dailyQuery = `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN activity_type IN ('productive', 'other')
            THEN duration_minutes
            ELSE 0
          END
        ),
        0
      ) AS productive_minutes,

      COALESCE(
        SUM(
          CASE
            WHEN activity_type = 'recreational'
            THEN duration_minutes
            ELSE 0
          END
        ),
        0
      ) AS recreational_minutes,

      COALESCE(
        SUM(duration_minutes),
        0
      ) AS digital_minutes

    FROM activities
    WHERE user_id = $1
      AND daily_entry_id = (
        SELECT daily_entry_id
        FROM daily_entries
        WHERE user_id = $1
          AND entry_date = $2
      );
  `;


  const taskQuery = `
    SELECT
      COUNT(*) AS total_tasks,

      COUNT(*) FILTER (
        WHERE status = 'completed'
      ) AS completed_tasks,

      COALESCE(
        SUM(planned_minutes),
        0
      ) AS planned_minutes,

      COALESCE(
        SUM(actual_minutes),
        0
      ) AS actual_minutes

    FROM tasks
    WHERE user_id = $1
      AND daily_entry_id = (
        SELECT daily_entry_id
        FROM daily_entries
        WHERE user_id = $1
          AND entry_date = $2
      );
  `;


  const entryQuery = `
    SELECT *
    FROM daily_entries
    WHERE user_id = $1
      AND entry_date = $2;
  `;


  const [
    dailyResult,
    taskResult,
    entryResult,
  ] = await Promise.all([
    pool.query(dailyQuery, [
      userId,
      entryDate,
    ]),

    pool.query(taskQuery, [
      userId,
      entryDate,
    ]),

    pool.query(entryQuery, [
      userId,
      entryDate,
    ]),
  ]);


  const activity = dailyResult.rows[0];
  const tasks = taskResult.rows[0];
  const entry = entryResult.rows[0] || null;


  const totalTasks =
    Number(tasks.total_tasks);

  const completedTasks =
    Number(tasks.completed_tasks);


  const completionRate =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0;


  return {
    date: entryDate,

    dayType: entry?.day_type || null,

    mainGoal: entry?.main_goal || null,

    goalCategory:
      entry?.goal_category || null,

    digitalMinutes:
      Number(activity.digital_minutes),

    productiveMinutes:
      Number(activity.productive_minutes),

    recreationalMinutes:
      Number(activity.recreational_minutes),

    totalTasks,

    completedTasks,

    plannedMinutes:
      Number(tasks.planned_minutes),

    actualMinutes:
      Number(tasks.actual_minutes),

    completionRate,
  };
};


/* ---------- Weekly Analytics ---------- */

const getWeeklyAnalytics = async (
  userId,
  startDate,
  endDate
) => {

  const query = `
    SELECT
      d.entry_date,

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
            AND a.activity_type = 'recreational'
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
      AND d.entry_date BETWEEN $2 AND $3

    ORDER BY d.entry_date ASC;
  `;


  const result = await pool.query(query, [
    userId,
    startDate,
    endDate,
  ]);


  const days = result.rows.map((day) => {

    const totalTasks =
      Number(day.total_tasks);

    const completedTasks =
      Number(day.completed_tasks);

    const completionRate =
      totalTasks > 0
        ? Math.round(
            (completedTasks / totalTasks) * 100
          )
        : 0;

    return {
      date: day.entry_date,
      dayType: day.day_type,
      mainGoal: day.main_goal,
      goalCategory: day.goal_category,

      digitalMinutes:
        Number(day.digital_minutes),

      productiveMinutes:
        Number(day.productive_minutes),

      recreationalMinutes:
        Number(day.recreational_minutes),

      totalTasks,

      completedTasks,

      plannedMinutes:
        Number(day.planned_minutes),

      actualMinutes:
        Number(day.actual_minutes),

      completionRate,
    };
  });


  const totals = days.reduce(
    (acc, day) => ({
      digitalMinutes:
        acc.digitalMinutes +
        day.digitalMinutes,

      productiveMinutes:
        acc.productiveMinutes +
        day.productiveMinutes,

      recreationalMinutes:
        acc.recreationalMinutes +
        day.recreationalMinutes,

      totalTasks:
        acc.totalTasks +
        day.totalTasks,

      completedTasks:
        acc.completedTasks +
        day.completedTasks,

      plannedMinutes:
        acc.plannedMinutes +
        day.plannedMinutes,

      actualMinutes:
        acc.actualMinutes +
        day.actualMinutes,
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
      ? Math.round(
          (totals.completedTasks /
            totals.totalTasks) *
            100
        )
      : 0;


  return {
    startDate,
    endDate,
    days,
    totals: {
      ...totals,
      completionRate,
    },
  };
};


module.exports = {
  getDailyAnalytics,
  getWeeklyAnalytics,
};