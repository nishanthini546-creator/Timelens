import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Clock3,
  Target,
  CheckCircle2,
  Activity,
  ArrowRight,
  LogOut,
  CalendarDays,
  Zap,
  Play,
  ListChecks,
  Flame,
  Trophy,
  Lock,
  Sparkles,
  Timer,
  Award,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import GlassCard from "../../components/glasscard";

import {
  getDailyEntry,
  getLatestDailyEntry,
  getTasks,
  getActivities,
  getDailyAnalytics,
  getWeeklyAnalytics,
} from "../../services/api";


/* =========================================================
   SAMPLE DASHBOARD DATA
========================================================= */

const SAMPLE_DASHBOARD_DATA = {
  user: {
    name: "Nishanthini",
    username: "Nishanthini",
  },

  goal:
    "Complete development tasks and improve my productivity",

  entryDate: "2026-09-25",

  tasks: [
    {
      id: "sample-task-1",
      name: "Java Practice",
      minutes: 60,
      priority: "High",
      completed: true,
      status: "completed",
    },
    {
      id: "sample-task-2",
      name: "TimeLens Project Work",
      minutes: 90,
      priority: "High",
      completed: true,
      status: "completed",
    },
    {
      id: "sample-task-3",
      name: "DSA Practice",
      minutes: 45,
      priority: "Medium",
      completed: false,
      status: "pending",
    },
    {
      id: "sample-task-4",
      name: "Technical Reading",
      minutes: 30,
      priority: "Low",
      completed: false,
      status: "pending",
    },
    {
      id: "sample-task-5",
      name: "Project Documentation",
      minutes: 40,
      priority: "Medium",
      completed: true,
      status: "completed",
    },
  ],

  activities: [
    {
      id: "sample-activity-1",
      name: "Coding",
      type: "productive",
      duration_minutes: 120,
    },
    {
      id: "sample-activity-2",
      name: "Project Work",
      type: "productive",
      duration_minutes: 90,
    },
    {
      id: "sample-activity-3",
      name: "Learning",
      type: "productive",
      duration_minutes: 60,
    },
    {
      id: "sample-activity-4",
      name: "Social Media",
      type: "recreational",
      duration_minutes: 35,
    },
    {
      id: "sample-activity-5",
      name: "YouTube",
      type: "recreational",
      duration_minutes: 25,
    },
  ],

  dailyAnalytics: {
    digital_minutes: 330,
    productive_minutes: 270,
    recreational_minutes: 60,
    productivity_percentage: 82,
  },

  weeklyAnalytics: [
    {
      day: "Mon",
      productive: 210,
      recreational: 55,
      digital: 265,
    },
    {
      day: "Tue",
      productive: 245,
      recreational: 45,
      digital: 290,
    },
    {
      day: "Wed",
      productive: 180,
      recreational: 70,
      digital: 250,
    },
    {
      day: "Thu",
      productive: 300,
      recreational: 40,
      digital: 340,
    },
    {
      day: "Fri",
      productive: 270,
      recreational: 60,
      digital: 330,
    },
    {
      day: "Sat",
      productive: 120,
      recreational: 95,
      digital: 215,
    },
    {
      day: "Sun",
      productive: 90,
      recreational: 80,
      digital: 170,
    },
  ],

  streak: 5,
};


/* =========================================================
   DATE
========================================================= */

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [weeklyAnalytics, setWeeklyAnalytics] =
    useState(null);

  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] =
    useState([]);

  const [goal, setGoal] = useState("");
  const [entryDate, setEntryDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const storedUser =
        localStorage.getItem(
          "timelens_user"
        );

      const token =
        localStorage.getItem(
          "timelens_token"
        );

      if (!storedUser || !token) {
        navigate("/auth");
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      setUser(parsedUser);

      const today = getToday();

      let entryResponse = null;

      try {
        entryResponse =
          await getDailyEntry(today);
      } catch {
        entryResponse = null;
      }

      let entry =
        entryResponse?.data ||
        entryResponse ||
        null;

      if (!entry) {
        try {
          const latestResponse =
            await getLatestDailyEntry();

          entry =
            latestResponse?.data ||
            latestResponse ||
            null;
        } catch {
          entry = null;
        }
      }


      /* -------------------------------------------------------
         NO BACKEND DATA
         Use sample data
      ------------------------------------------------------- */

      if (!entry) {
        setUser(
          parsedUser ||
          SAMPLE_DASHBOARD_DATA.user
        );

        setGoal(
          SAMPLE_DASHBOARD_DATA.goal
        );

        setEntryDate(
          SAMPLE_DASHBOARD_DATA.entryDate
        );

        setTasks(
          SAMPLE_DASHBOARD_DATA.tasks
        );

        setActivities(
          SAMPLE_DASHBOARD_DATA.activities
        );

        setAnalytics(
          SAMPLE_DASHBOARD_DATA.dailyAnalytics
        );

        setWeeklyAnalytics(
          SAMPLE_DASHBOARD_DATA.weeklyAnalytics
        );

        setLoading(false);

        return;
      }


      /* -------------------------------------------------------
         BACKEND ENTRY EXISTS
      ------------------------------------------------------- */

      const entryId =
        entry.id ||
        entry._id;

      setEntryDate(
        entry.date ||
        today
      );

      setGoal(
        entry.goal ||
        SAMPLE_DASHBOARD_DATA.goal
      );


      if (!entryId) {
        setTasks(
          SAMPLE_DASHBOARD_DATA.tasks
        );

        setActivities(
          SAMPLE_DASHBOARD_DATA.activities
        );

        setAnalytics(
          SAMPLE_DASHBOARD_DATA.dailyAnalytics
        );

        setWeeklyAnalytics(
          SAMPLE_DASHBOARD_DATA.weeklyAnalytics
        );

        setLoading(false);

        return;
      }


      /* -------------------------------------------------------
         LOAD REAL DATA
      ------------------------------------------------------- */

      let tasksResponse = null;
      let activitiesResponse = null;
      let analyticsResponse = null;
      let weeklyResponse = null;


      try {
        tasksResponse =
          await getTasks(entryId);
      } catch {
        tasksResponse = null;
      }


      try {
        activitiesResponse =
          await getActivities(entryId);
      } catch {
        activitiesResponse = null;
      }


      try {
        analyticsResponse =
          await getDailyAnalytics(
            entryId
          );
      } catch {
        analyticsResponse = null;
      }


      try {
        weeklyResponse =
          await getWeeklyAnalytics();
      } catch {
        weeklyResponse = null;
      }


      const realTasks =
        tasksResponse?.data ||
        tasksResponse ||
        [];

      const realActivities =
        activitiesResponse?.data ||
        activitiesResponse ||
        [];

      const realAnalytics =
        analyticsResponse?.data ||
        analyticsResponse ||
        null;

      const realWeekly =
        weeklyResponse?.data ||
        weeklyResponse ||
        null;


      /* -------------------------------------------------------
         REAL DATA IF AVAILABLE
         SAMPLE DATA ONLY AS FALLBACK
      ------------------------------------------------------- */

      setTasks(
        Array.isArray(realTasks) &&
        realTasks.length > 0
          ? realTasks
          : SAMPLE_DASHBOARD_DATA.tasks
      );

      setActivities(
        Array.isArray(realActivities) &&
        realActivities.length > 0
          ? realActivities
          : SAMPLE_DASHBOARD_DATA.activities
      );

      setAnalytics(
        realAnalytics ||
        SAMPLE_DASHBOARD_DATA.dailyAnalytics
      );

      setWeeklyAnalytics(
        realWeekly ||
        SAMPLE_DASHBOARD_DATA.weeklyAnalytics
      );

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );


      /* -------------------------------------------------------
         COMPLETE SAMPLE FALLBACK
      ------------------------------------------------------- */

      setUser(
        SAMPLE_DASHBOARD_DATA.user
      );

      setGoal(
        SAMPLE_DASHBOARD_DATA.goal
      );

      setEntryDate(
        SAMPLE_DASHBOARD_DATA.entryDate
      );

      setTasks(
        SAMPLE_DASHBOARD_DATA.tasks
      );

      setActivities(
        SAMPLE_DASHBOARD_DATA.activities
      );

      setAnalytics(
        SAMPLE_DASHBOARD_DATA.dailyAnalytics
      );

      setWeeklyAnalytics(
        SAMPLE_DASHBOARD_DATA.weeklyAnalytics
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem(
      "timelens_token"
    );

    localStorage.removeItem(
      "timelens_user"
    );

    navigate("/auth");
  };


  /* =========================================================
     DISPLAY DATA
  ========================================================= */

  const displayUser =
    user ||
    SAMPLE_DASHBOARD_DATA.user;

  const displayGoal =
    goal ||
    SAMPLE_DASHBOARD_DATA.goal;

  const displayDate =
    entryDate ||
    SAMPLE_DASHBOARD_DATA.entryDate;


  const displayTasks =
    tasks.length > 0
      ? tasks
      : SAMPLE_DASHBOARD_DATA.tasks;

  const displayActivities =
    activities.length > 0
      ? activities
      : SAMPLE_DASHBOARD_DATA.activities;


  /* =========================================================
     HELPERS
  ========================================================= */

  const formatMinutes = (
    minutes = 0
  ) => {
    const total =
      Number(minutes) || 0;

    const hours =
      Math.floor(total / 60);

    const mins =
      total % 60;

    if (hours === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  };


  const firstName =
    displayUser?.name
      ?.split(" ")[0] ||
    displayUser?.username
      ?.split(" ")[0] ||
    "there";


  /* =========================================================
     TASK CALCULATIONS
  ========================================================= */

  const completedTasks =
    useMemo(() => {
      return displayTasks.filter(
        (task) =>
          task.completed === true ||
          task.status === "completed"
      );
    }, [displayTasks]);


  const taskCompletion =
    useMemo(() => {
      if (
        displayTasks.length === 0
      ) {
        return 0;
      }

      return Math.round(
        (
          completedTasks.length /
          displayTasks.length
        ) * 100
      );
    }, [
      displayTasks,
      completedTasks,
    ]);


  const plannedMinutes =
    useMemo(() => {
      return displayTasks.reduce(
        (total, task) =>
          total +
          Number(
            task.minutes ||
            task.duration_minutes ||
            task.duration ||
            0
          ),
        0
      );
    }, [displayTasks]);


  /* =========================================================
     ACTIVITY CALCULATIONS
  ========================================================= */

  const digitalMinutes =
    useMemo(() => {
      const value =
        displayActivities.reduce(
          (total, activity) =>
            total +
            Number(
              activity.duration_minutes ||
              activity.duration ||
              0
            ),
          0
        );

      return value > 0
        ? value
        : Number(
            analytics?.digital_minutes ||
            SAMPLE_DASHBOARD_DATA
              .dailyAnalytics
              .digital_minutes
          );
    }, [
      displayActivities,
      analytics,
    ]);


  const productiveMinutes =
    useMemo(() => {
      return displayActivities
        .filter(
          (activity) =>
            activity.type ===
            "productive"
        )
        .reduce(
          (total, activity) =>
            total +
            Number(
              activity.duration_minutes ||
              activity.duration ||
              0
            ),
          0
        );
    }, [displayActivities]);


  const recreationalMinutes =
    useMemo(() => {
      return displayActivities
        .filter(
          (activity) =>
            activity.type ===
            "recreational"
        )
        .reduce(
          (total, activity) =>
            total +
            Number(
              activity.duration_minutes ||
              activity.duration ||
              0
            ),
          0
        );
    }, [displayActivities]);


  const productivePercentage =
    useMemo(() => {
      if (digitalMinutes === 0) {
        return 0;
      }

      return Math.round(
        (
          productiveMinutes /
          digitalMinutes
        ) * 100
      );
    }, [
      productiveMinutes,
      digitalMinutes,
    ]);


  const recreationalPercentage =
    useMemo(() => {
      if (digitalMinutes === 0) {
        return 0;
      }

      return Math.round(
        (
          recreationalMinutes /
          digitalMinutes
        ) * 100
      );
    }, [
      recreationalMinutes,
      digitalMinutes,
    ]);


  /* =========================================================
     PRODUCTIVITY SCORE
  ========================================================= */

  const productivityScore =
    useMemo(() => {
      const taskScore =
        taskCompletion * 0.45;

      const productiveScore =
        productivePercentage * 0.4;

      const activityScore =
        displayActivities.length > 0
          ? 15
          : 0;

      return Math.min(
        100,
        Math.round(
          taskScore +
          productiveScore +
          activityScore
        )
      );
    }, [
      taskCompletion,
      productivePercentage,
      displayActivities,
    ]);


  const productivityLabel =
    useMemo(() => {
      if (productivityScore >= 85) {
        return "Excellent";
      }

      if (productivityScore >= 70) {
        return "Strong";
      }

      if (productivityScore >= 50) {
        return "Good";
      }

      return "Getting Started";
    }, [productivityScore]);


  /* =========================================================
     SCORE BREAKDOWN
  ========================================================= */

  const scoreBreakdown = [
    {
      label: "Task Completion",
      value: taskCompletion,
      icon: CheckCircle2,
    },
    {
      label: "Productive Time",
      value: productivePercentage,
      icon: Zap,
    },
    {
      label: "Activity Tracking",
      value:
        displayActivities.length > 0
          ? 100
          : 0,
      icon: Activity,
    },
  ];


  /* =========================================================
     STREAK
  ========================================================= */

  const currentStreak =
    SAMPLE_DASHBOARD_DATA.streak;


  const streakDays = [
    {
      day: "Mon",
      active: true,
    },
    {
      day: "Tue",
      active: true,
    },
    {
      day: "Wed",
      active: true,
    },
    {
      day: "Thu",
      active: true,
    },
    {
      day: "Fri",
      active: true,
    },
    {
      day: "Sat",
      active: false,
    },
    {
      day: "Sun",
      active: false,
    },
  ];


  /* =========================================================
     ACHIEVEMENTS
  ========================================================= */

  const achievements = [
    {
      id: 1,
      title: "First Step",
      description:
        "Complete your first task",
      icon: CheckCircle2,
      unlocked:
        completedTasks.length >= 1,
    },

    {
      id: 2,
      title: "Goal Setter",
      description:
        "Set a daily productivity goal",
      icon: Target,
      unlocked:
        Boolean(displayGoal),
    },

    {
      id: 3,
      title: "5 Day Streak",
      description:
        "Stay productive for 5 days",
      icon: Flame,
      unlocked:
        currentStreak >= 5,
    },

    {
      id: 4,
      title: "Time in Action",
      description:
        "Track your first activity",
      icon: Timer,
      unlocked:
        displayActivities.length >= 1,
    },

    {
      id: 5,
      title: "Task Master",
      description:
        "Complete 5 tasks",
      icon: Trophy,
      unlocked:
        completedTasks.length >= 5,
    },

    {
      id: 6,
      title: "Productivity Pro",
      description:
        "Reach a score of 85",
      icon: Award,
      unlocked:
        productivityScore >= 85,
    },
  ];


  const unlockedAchievements =
    achievements.filter(
      (item) => item.unlocked
    ).length;


  /* =========================================================
     WEEKLY CHART
  ========================================================= */

  const weeklyChartData =
    useMemo(() => {
      if (
        Array.isArray(
          weeklyAnalytics
        ) &&
        weeklyAnalytics.length > 0
      ) {
        return weeklyAnalytics.map(
          (item) => ({
            day:
              item.day ||
              item.date ||
              "",

            productive:
              Number(
                item.productive ||
                item.productive_minutes ||
                0
              ),

            recreational:
              Number(
                item.recreational ||
                item.recreational_minutes ||
                0
              ),

            digital:
              Number(
                item.digital ||
                item.digital_minutes ||
                0
              ),
          })
        );
      }

      return SAMPLE_DASHBOARD_DATA
        .weeklyAnalytics;
    }, [weeklyAnalytics]);


  /* =========================================================
     ACTIVITY CHART
  ========================================================= */

  const activityChartData =
    useMemo(() => {
      return displayActivities.map(
        (activity) => ({
          name:
            activity.name ||
            "Activity",

          duration:
            Number(
              activity.duration_minutes ||
              activity.duration ||
              0
            ),
        })
      );
    }, [displayActivities]);


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="loading-orbit">
          <div className="loading-core">
            <Clock3 size={27} />
          </div>
        </div>

        <h3>
          Preparing your TimeLens...
        </h3>

        <p>
          Loading your productivity space
        </p>

      </div>
    );
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dashboard-page">


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="dashboard-nav">

        {/* LOGO */}

        <button
          type="button"
          className="dashboard-brand"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <div className="brand-mark">
            <Clock3 size={19} />
          </div>

          <span>
            TimeLens
          </span>

        </button>


        {/* NAVIGATION LINKS */}

        <div className="dashboard-nav-links">

          <button
            type="button"
            className="dashboard-nav-link active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>


          <button
            type="button"
            className="dashboard-nav-link"
            onClick={() =>
              navigate("/plan-track")
            }
          >
            Plan & Track
          </button>


          <button
            type="button"
            className="dashboard-nav-link"
            onClick={() =>
              navigate("/calendar")
            }
          >
            Calendar
          </button>


          <button
            type="button"
            className="dashboard-nav-link"
            onClick={() =>
              navigate("/insights")
            }
          >
            Insights
          </button>


          <button
            type="button"
            className="dashboard-nav-link"
            onClick={() =>
              navigate("/profile")
            }
          >
            Profile
          </button>

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </button>

      </nav>


      <main className="dashboard-main">


        {/* ===================================================
            HERO
        =================================================== */}

        <section className="dashboard-hero">

          <div>

            <div className="dashboard-eyebrow">
              <Sparkles size={14} />
              YOUR PRODUCTIVITY SPACE
            </div>

            <h1>
              Welcome back,{" "}
              <span>
                {firstName}
              </span>.
            </h1>

            <p>
              Here's a clear view of how
              your time is moving today.
            </p>

          </div>


          <div className="dashboard-date">

            <CalendarDays size={17} />

            <div>

              <small>
                TODAY
              </small>

              <strong>
                {displayDate}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================================
            DIGITAL TIME
        =================================================== */}

        <section className="dashboard-time-card">

          <div className="time-card-glow" />

          <div className="time-card-content">

            <div className="time-card-label">
              <Clock3 size={16} />
              DIGITAL TIME
            </div>

            <div className="time-card-value">
              {formatMinutes(
                digitalMinutes
              )}
            </div>

            <p>
              Total tracked digital activity
            </p>

          </div>


          <div className="time-card-ring">

            <div className="time-ring-inner">

              <Zap size={22} />

              <span>
                {productivePercentage}%
              </span>

              <small>
                productive
              </small>

            </div>

          </div>

        </section>


        {/* ===================================================
            ALL MAIN STATS
        =================================================== */}

        <section className="dashboard-stat-grid">

          <GlassCard>

            <div className="stat-card-inner">

              <div className="stat-icon">
                <ListChecks size={21} />
              </div>

              <div>

                <span>
                  TASKS
                </span>

                <strong>
                  {completedTasks.length}

                  <small>
                    /{displayTasks.length}
                  </small>
                </strong>

                <p>
                  {taskCompletion}%
                  completed
                </p>

              </div>

            </div>

          </GlassCard>


          <GlassCard>

            <div className="stat-card-inner">

              <div className="stat-icon">
                <Target size={21} />
              </div>

              <div>

                <span>
                  DAILY GOAL
                </span>

                <strong>
                  Active
                </strong>

                <p>
                  Goal set
                </p>

              </div>

            </div>

          </GlassCard>


          <GlassCard>

            <div className="stat-card-inner">

              <div className="stat-icon">
                <Activity size={21} />
              </div>

              <div>

                <span>
                  ACTIVITIES
                </span>

                <strong>
                  {displayActivities.length}
                </strong>

                <p>
                  {formatMinutes(
                    productiveMinutes
                  )}{" "}
                  productive
                </p>

              </div>

            </div>

          </GlassCard>


          <GlassCard>

            <div className="stat-card-inner">

              <div className="stat-icon">
                <Flame size={21} />
              </div>

              <div>

                <span>
                  STREAK
                </span>

                <strong>
                  {currentStreak}

                  <small>
                    days
                  </small>
                </strong>

                <p>
                  Keep going
                </p>

              </div>

            </div>

          </GlassCard>

        </section>


        {/* ===================================================
            PRODUCTIVITY SCORE
        =================================================== */}

        <section className="productivity-score-section">

          <div className="feature-heading">

            <div>

              <div className="feature-kicker">
                <Zap size={14} />
                PRODUCTIVITY INSIGHT
              </div>

              <h2>
                Productivity Score
              </h2>

              <p>
                Your overall productivity
                performance for today.
              </p>

            </div>


            <div className="score-live-badge">

              <span />

              LIVE SCORE

            </div>

          </div>


          <div className="productivity-score-card">

            <div className="score-orb score-orb-one" />
            <div className="score-orb score-orb-two" />


            {/* SCORE */}

            <div className="score-circle-area">

              <div
                className="score-circle"
                style={{
                  "--score":
                    `${productivityScore * 3.6}deg`,
                }}
              >

                <div className="score-circle-inner">

                  <strong>
                    {productivityScore}
                  </strong>

                  <span>
                    /100
                  </span>

                </div>

              </div>


              <div className="score-status">

                <span />

                {productivityLabel}

              </div>

            </div>


            {/* SCORE DETAILS */}

            <div className="score-information">

              <div className="score-title-row">

                <div>

                  <span>
                    TODAY'S PERFORMANCE
                  </span>

                  <h3>
                    Your productivity
                    <br />

                    <strong>
                      is building momentum.
                    </strong>
                  </h3>

                </div>


                <div className="score-trophy">
                  <Trophy size={24} />
                </div>

              </div>


              <div className="score-breakdown">

                {scoreBreakdown.map(
                  (item) => {

                    const Icon =
                      item.icon;

                    return (
                      <div
                        className="score-breakdown-item"
                        key={item.label}
                      >

                        <div className="breakdown-top">

                          <div className="breakdown-name">

                            <div className="breakdown-icon">
                              <Icon size={14} />
                            </div>

                            {item.label}

                          </div>

                          <strong>
                            {item.value}%
                          </strong>

                        </div>


                        <div className="breakdown-track">

                          <div
                            className="breakdown-fill"
                            style={{
                              width:
                                `${item.value}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>


              <div className="score-summary">

                <div>

                  <small>
                    PLANNED
                  </small>

                  <strong>
                    {formatMinutes(
                      plannedMinutes
                    )}
                  </strong>

                </div>


                <div>

                  <small>
                    PRODUCTIVE
                  </small>

                  <strong>
                    {formatMinutes(
                      productiveMinutes
                    )}
                  </strong>

                </div>


                <div>

                  <small>
                    RECREATIONAL
                  </small>

                  <strong>
                    {formatMinutes(
                      recreationalMinutes
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            STREAK
        =================================================== */}

        <section className="streak-section">

          <div className="feature-heading">

            <div>

              <div className="feature-kicker">
                <Flame size={14} />
                YOUR MOMENTUM
              </div>

              <h2>
                Productivity Streak
              </h2>

              <p>
                You have stayed productive
                for {currentStreak} days.
              </p>

            </div>


            <div className="streak-counter">

              <Flame size={18} />

              <strong>
                {currentStreak}
              </strong>

              <span>
                day streak
              </span>

            </div>

          </div>


          <div className="streak-card">

            <div className="streak-line" />

            <div className="streak-days">

              {streakDays.map(
                (item) => (

                  <div
                    className="streak-day"
                    key={item.day}
                  >

                    <div
                      className={`streak-dot ${
                        item.active
                          ? "active"
                          : ""
                      }`}
                    >

                      {item.active && (
                        <CheckCircle2
                          size={16}
                        />
                      )}

                    </div>

                    <span>
                      {item.day}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        </section>


        {/* ===================================================
            ACHIEVEMENTS
        =================================================== */}

        <section className="achievements-section">

          <div className="feature-heading">

            <div>

              <div className="feature-kicker">
                <Trophy size={14} />
                MILESTONES
              </div>

              <h2>
                Achievements
              </h2>

              <p>
                Your productivity milestones
                and unlocked rewards.
              </p>

            </div>


            <div className="achievement-count">

              <Award size={17} />

              <strong>
                {unlockedAchievements}
              </strong>

              <span>
                / {achievements.length}
              </span>

            </div>

          </div>


          <div className="achievement-grid">

            {achievements.map(
              (achievement) => {

                const Icon =
                  achievement.icon;

                return (
                  <div
                    className={`achievement-card ${
                      achievement.unlocked
                        ? "unlocked"
                        : "locked"
                    }`}
                    key={achievement.id}
                  >

                    <div className="achievement-glow" />


                    <div className="achievement-icon">

                      {achievement.unlocked ? (
                        <Icon size={25} />
                      ) : (
                        <Lock size={21} />
                      )}

                    </div>


                    <div className="achievement-status">

                      {achievement.unlocked ? (
                        <>
                          <span />
                          UNLOCKED
                        </>
                      ) : (
                        <>
                          <Lock size={10} />
                          LOCKED
                        </>
                      )}

                    </div>


                    <h3>
                      {achievement.title}
                    </h3>

                    <p>
                      {achievement.description}
                    </p>


                    {achievement.unlocked && (
                      <div className="achievement-check">
                        <CheckCircle2
                          size={17}
                        />
                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>

        </section>


        {/* ===================================================
            GOAL
        =================================================== */}

        <section className="goal-plan-grid">

          <GlassCard>

            <div className="large-card-heading">

              <div className="large-card-icon">
                <Target size={20} />
              </div>

              <div>

                <span>
                  TODAY'S GOAL
                </span>

                <h3>
                  {displayGoal}
                </h3>

              </div>

            </div>


            <div className="goal-progress">

              <div className="goal-progress-top">

                <span>
                  Task progress
                </span>

                <strong>
                  {taskCompletion}%
                </strong>

              </div>


              <div className="goal-progress-track">

                <div
                  className="goal-progress-fill"
                  style={{
                    width:
                      `${taskCompletion}%`,
                  }}
                />

              </div>

            </div>


            <button
              type="button"
              className="dashboard-action-button"
              onClick={() =>
                navigate("/plan-track")
              }
            >
              Open Plan & Track
              <ArrowRight size={16} />
            </button>

          </GlassCard>


          <GlassCard>

            <div className="large-card-heading">

              <div className="large-card-icon">
                <Play size={20} />
              </div>

              <div>

                <span>
                  QUICK ACTION
                </span>

                <h3>
                  Continue planning
                </h3>

              </div>

            </div>


            <p className="large-card-description">
              Continue your tasks,
              activities and daily plan.
            </p>


            <button
              type="button"
              className="dashboard-action-button"
              onClick={() =>
                navigate("/plan-track")
              }
            >
              Continue
              <ArrowRight size={16} />
            </button>

          </GlassCard>

        </section>


        {/* ===================================================
            ACTIVITY + WEEKLY CHARTS
        =================================================== */}

        <section className="charts-grid">

          <GlassCard>

            <div className="chart-heading">

              <div>

                <span>
                  ACTIVITY BREAKDOWN
                </span>

                <h3>
                  Today's digital activity
                </h3>

              </div>

              <Activity size={20} />

            </div>


            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    activityChartData
                  }
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(90,55,30,0.12)"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fill: "#654d3c",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "#654d3c",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="duration"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                    fill="#c76b45"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </GlassCard>


          <GlassCard>

            <div className="chart-heading">

              <div>

                <span>
                  WEEKLY TREND
                </span>

                <h3>
                  Productivity rhythm
                </h3>

              </div>

              <CalendarDays size={20} />

            </div>


            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={
                    weeklyChartData
                  }
                >

                  <defs>

                    <linearGradient
                      id="productivityArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#c76b45"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="100%"
                        stopColor="#c76b45"
                        stopOpacity={0.03}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(90,55,30,0.12)"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                      fill: "#654d3c",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "#654d3c",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="productive"
                    stroke="#c76b45"
                    strokeWidth={3}
                    fill="url(#productivityArea)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </GlassCard>

        </section>


        {/* ===================================================
            PERSPECTIVE
        =================================================== */}

        <section className="perspective-card">

          <div className="perspective-icon">
            <Sparkles size={21} />
          </div>

          <div>

            <span>
              TIME LENS
            </span>

            <h3>
              Your time tells a story.
            </h3>

            <p>
              You planned{" "}
              <strong>
                {formatMinutes(
                  plannedMinutes
                )}
              </strong>{" "}
              today and have already
              tracked{" "}
              <strong>
                {formatMinutes(
                  digitalMinutes
                )}
              </strong>.
            </p>

          </div>

        </section>


        <div className="dashboard-bottom">

          <button
            type="button"
            className="bottom-logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sign out of TimeLens
          </button>

        </div>

      </main>


      {/* =====================================================
          PAGE-SPECIFIC CSS
      ===================================================== */}

      <style>{dashboardStyles}</style>

    </div>
  );
}


/* =========================================================
   DASHBOARD CSS
========================================================= */

const dashboardStyles = `

.dashboard-page {
  min-height: 100vh;
  padding-bottom: 70px;
  color: #453126;
}

.dashboard-main,
.dashboard-nav {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}


/* =========================================================
   NAVIGATION
========================================================= */

.dashboard-nav {
  min-height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  position: relative;
  z-index: 20;
}


/* LOGO */

.dashboard-brand {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 0;

  border: 0;
  background: transparent;

  color: #453126;

  font-size: 20px;
  font-weight: 800;

  cursor: pointer;

  white-space: nowrap;
}

.brand-mark {
  width: 38px;
  height: 38px;

  border-radius: 12px;

  display: grid;
  place-items: center;

  color: white;

  background:
    linear-gradient(
      135deg,
      #d7794d,
      #a94e38
    );

  box-shadow:
    0 8px 24px
    rgba(168,79,55,.25);

  transition: .25s ease;
}

.dashboard-brand:hover .brand-mark {
  transform:
    rotate(-6deg)
    scale(1.05);
}


/* NAV LINKS */

.dashboard-nav-links {
  display: flex;
  align-items: center;

  gap: 5px;

  flex: 1;

  justify-content: center;
}

.dashboard-nav-link {
  position: relative;

  border: 0;
  background: transparent;

  color: #745d4c;

  padding: 10px 14px;

  border-radius: 10px;

  cursor: pointer;

  font-size: 13px;
  font-weight: 650;

  transition:
    color .25s ease,
    background .25s ease,
    transform .25s ease;
}

.dashboard-nav-link:hover {
  color: #8d402d;

  background:
    rgba(255,255,255,.58);

  transform:
    translateY(-1px);
}

.dashboard-nav-link.active {
  color: #8d402d;

  background:
    rgba(255,255,255,.72);
}

.dashboard-nav-link.active::after {
  content: "";

  position: absolute;

  left: 50%;
  bottom: 4px;

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #c76b45;

  transform:
    translateX(-50%);

  box-shadow:
    0 0 10px
    rgba(199,107,69,.55);
}


/* LOGOUT */

.dashboard-logout {
  border:
    1px solid
    rgba(120,78,52,.16);

  background:
    rgba(255,250,245,.65);

  color: #745b4a;

  padding: 9px 13px;

  border-radius: 10px;

  display: flex;
  align-items: center;
  gap: 7px;

  cursor: pointer;

  white-space: nowrap;

  transition: .25s ease;
}

.dashboard-logout:hover {
  color: #8d402d;

  background:
    rgba(255,255,255,.9);

  border-color:
    rgba(199,107,69,.3);

  transform:
    translateY(-1px);

  box-shadow:
    0 8px 22px
    rgba(168,79,55,.12);
}


/* =========================================================
   HERO
========================================================= */

.dashboard-hero {
  padding: 42px 0 28px;

  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  gap: 30px;
}

.dashboard-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;

  color: #a9583e;

  font-size: 13px;
  font-weight: 850;

  letter-spacing: 1.8px;
}

.dashboard-hero h1 {
  margin: 12px 0 0;

  font-size:
    clamp(42px, 5vw, 64px);

  line-height: 1.05;

  letter-spacing: -2.2px;

  color: #453126;

  font-weight: 800;
}

.dashboard-hero p {
  margin: 16px 0 0;

  color: #795f4e;

  font-size: 16px;

  line-height: 1.6;
}

.dashboard-date {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 12px 15px;

  border:
    1px solid
    rgba(122,79,52,.12);

  background:
    rgba(255,250,245,.55);

  border-radius: 14px;

  color: #a9583e;
}

.dashboard-date div {
  display: flex;
  flex-direction: column;
}

.dashboard-date small {
  font-size: 9px;
  color: #a88c78;
}

.dashboard-date strong {
  font-size: 13px;
}


/* =========================================================
   DIGITAL TIME
========================================================= */

.dashboard-time-card {
  min-height: 210px;

  position: relative;

  overflow: hidden;

  border-radius: 28px;

  padding: 38px 44px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background:
    linear-gradient(
      125deg,
      rgba(255,248,238,.94),
      rgba(250,226,203,.72)
    );

  border:
    1px solid
    rgba(173,101,65,.2);

  box-shadow:
    0 24px 65px
    rgba(119,70,43,.12);
}

.time-card-glow {
  position: absolute;

  width: 350px;
  height: 350px;

  right: -120px;
  top: -170px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(218,128,83,.28),
      transparent 70%
    );

  animation:
    timeGlow 7s ease-in-out infinite;
}

@keyframes timeGlow {
  50% {
    transform:
      translate(-25px,20px)
      scale(1.1);
  }
}

.time-card-content {
  position: relative;
  z-index: 2;
}

.time-card-label {
  display: flex;
  align-items: center;
  gap: 8px;

  color: #a75a40;

  font-size: 11px;
  font-weight: 800;

  letter-spacing: 1.5px;
}

.time-card-value {
  margin-top: 8px;

  font-size:
    clamp(46px,7vw,78px);

  font-weight: 800;

  letter-spacing: -4px;

  color: #4a3428;
}

.time-card-content p {
  margin: 4px 0 0;

  color: #846b59;
}

.time-card-ring {
  position: relative;
  z-index: 2;

  width: 145px;
  height: 145px;

  border-radius: 50%;

  display: grid;
  place-items: center;

  background:
    conic-gradient(
      #c76b45 0 70%,
      rgba(255,255,255,.35) 70%
    );

  animation:
    ringFloat 5s ease-in-out infinite;
}

.time-ring-inner {
  width: 115px;
  height: 115px;

  border-radius: 50%;

  background: #fff7ee;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  color: #a75239;
}

.time-ring-inner span {
  font-size: 27px;
  font-weight: 850;
}

.time-ring-inner small {
  color: #866d5c;
  font-size: 9px;
}

@keyframes ringFloat {
  50% {
    transform:
      translateY(-7px)
      rotate(3deg);
  }
}


/* =========================================================
   STATS
========================================================= */

.dashboard-stat-grid {
  display: grid;

  grid-template-columns:
    repeat(4,1fr);

  gap: 16px;

  margin-top: 18px;
}

.stat-card-inner {
  min-height: 105px;

  display: flex;
  align-items: center;

  gap: 13px;
}

.stat-icon {
  width: 43px;
  height: 43px;

  flex: 0 0 43px;

  border-radius: 13px;

  display: grid;
  place-items: center;

  color: #ad573d;

  background:
    rgba(204,112,75,.11);

  transition: .3s ease;
}

.stat-card-inner:hover .stat-icon {
  transform:
    rotate(-6deg)
    scale(1.08);
}

.stat-card-inner span {
  display: block;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1.3px;

  color: #9a806c;
}

.stat-card-inner strong {
  display: block;

  margin-top: 4px;

  font-size: 24px;

  color: #4d372a;
}

.stat-card-inner strong small {
  font-size: 13px;
  color: #927968;
}

.stat-card-inner p {
  margin: 3px 0 0;

  font-size: 11px;

  color: #8b715e;
}


/* =========================================================
   FEATURE HEADINGS
========================================================= */

.feature-heading {
  display: flex;

  justify-content: space-between;
  align-items: flex-end;

  gap: 20px;

  margin-bottom: 16px;
}

.feature-heading h2 {
  margin: 7px 0 0;

  font-size: 25px;

  color: #4b3529;
}

.feature-heading p {
  margin: 6px 0 0;

  color: #806858;

  font-size: 13px;
}


/* =========================================================
   SCORE
========================================================= */

.productivity-score-section {
  margin-top: 55px;
}

.score-live-badge {
  display: flex;
  align-items: center;
  gap: 7px;

  padding: 8px 12px;

  border-radius: 20px;

  background:
    rgba(199,107,69,.08);

  border:
    1px solid
    rgba(199,107,69,.17);

  color: #a7533a;

  font-size: 9px;

  font-weight: 850;
}

.score-live-badge span {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #c86b46;

  box-shadow:
    0 0 0 5px
    rgba(200,107,70,.1);

  animation:
    livePulse 2s infinite;
}

@keyframes livePulse {
  50% {
    box-shadow:
      0 0 0 9px
      rgba(200,107,70,.02);
  }
}

.productivity-score-card {
  min-height: 320px;

  position: relative;

  overflow: hidden;

  display: grid;

  grid-template-columns:
    290px 1fr;

  gap: 35px;

  align-items: center;

  padding: 35px 42px;

  border-radius: 27px;

  background:
    linear-gradient(
      130deg,
      rgba(255,248,239,.96),
      rgba(250,229,208,.82)
    );

  border:
    1px solid
    rgba(181,100,66,.22);

  box-shadow:
    0 22px 65px
    rgba(120,69,43,.12);
}

.score-orb {
  position: absolute;

  border-radius: 50%;

  pointer-events: none;
}

.score-orb-one {
  width: 260px;
  height: 260px;

  left: -110px;
  bottom: -130px;

  background:
    radial-gradient(
      circle,
      rgba(214,125,80,.2),
      transparent 70%
    );

  animation:
    orbMove 8s ease-in-out infinite;
}

.score-orb-two {
  width: 230px;
  height: 230px;

  right: -90px;
  top: -120px;

  background:
    radial-gradient(
      circle,
      rgba(236,177,119,.22),
      transparent 70%
    );

  animation:
    orbMove 10s ease-in-out infinite reverse;
}

@keyframes orbMove {
  50% {
    transform:
      translate(25px,-18px)
      scale(1.1);
  }
}

.score-circle-area {
  display: flex;

  flex-direction: column;

  align-items: center;
}

.score-circle {
  width: 190px;
  height: 190px;

  border-radius: 50%;

  display: grid;
  place-items: center;

  background:
    conic-gradient(
      #bd6245 0 var(--score),
      rgba(120,83,61,.1)
      var(--score) 360deg
    );

  box-shadow:
    0 15px 42px
    rgba(183,88,58,.18);

  animation:
    scoreEnter 1s ease both;
}

.score-circle::before {
  content: "";

  position: absolute;

  width: 172px;
  height: 172px;

  border-radius: 50%;

  background:
    linear-gradient(
      145deg,
      #fffaf4,
      #f5e1cd
    );
}

.score-circle-inner {
  position: relative;

  display: flex;
  align-items: baseline;
}

.score-circle-inner strong {
  font-size: 54px;

  line-height: 1;

  letter-spacing: -3px;

  color: #4a3327;
}

.score-circle-inner span {
  font-size: 13px;
  color: #947967;
}

@keyframes scoreEnter {
  from {
    opacity: 0;

    transform:
      scale(.7)
      rotate(-30deg);
  }

  to {
    opacity: 1;

    transform:
      scale(1)
      rotate(0);
  }
}

.score-status {
  margin-top: 15px;

  display: flex;
  align-items: center;

  gap: 7px;

  padding: 7px 12px;

  border-radius: 20px;

  background:
    rgba(255,255,255,.62);

  color: #775a48;

  font-size: 11px;

  font-weight: 750;
}

.score-status span {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #c66a46;
}

.score-information {
  position: relative;
  z-index: 2;
}

.score-title-row {
  display: flex;

  justify-content: space-between;

  gap: 20px;
}

.score-title-row > div:first-child > span {
  font-size: 9px;

  font-weight: 850;

  letter-spacing: 1.5px;

  color: #a17f68;
}

.score-title-row h3 {
  margin: 7px 0 23px;

  font-size: 27px;

  line-height: 1.12;

  color: #4d372b;
}

.score-title-row h3 strong {
  color: #b75c40;
}

.score-trophy {
  width: 48px;
  height: 48px;

  flex: 0 0 48px;

  border-radius: 15px;

  display: grid;
  place-items: center;

  color: #b35c40;

  background:
    rgba(195,106,69,.1);

  animation:
    trophyFloat 4s ease-in-out infinite;
}

@keyframes trophyFloat {
  50% {
    transform:
      translateY(-5px)
      rotate(4deg);
  }
}

.score-breakdown {
  display: flex;

  flex-direction: column;

  gap: 14px;
}

.breakdown-top {
  display: flex;

  justify-content: space-between;

  margin-bottom: 6px;
}

.breakdown-name {
  display: flex;

  align-items: center;

  gap: 8px;

  color: #6e5645;

  font-size: 11px;

  font-weight: 650;
}

.breakdown-icon {
  width: 25px;
  height: 25px;

  border-radius: 8px;

  display: grid;
  place-items: center;

  color: #b75b3f;

  background:
    rgba(190,95,62,.08);
}

.breakdown-top strong {
  color: #9d593f;

  font-size: 11px;
}

.breakdown-track {
  height: 6px;

  border-radius: 10px;

  overflow: hidden;

  background:
    rgba(119,81,61,.09);
}

.breakdown-fill {
  height: 100%;

  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      #c66a47,
      #e09b72
    );

  box-shadow:
    0 0 12px
    rgba(201,104,68,.2);

  transition:
    width 1s ease;
}

.score-summary {
  margin-top: 21px;

  padding-top: 16px;

  border-top:
    1px solid
    rgba(130,88,64,.1);

  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 12px;
}

.score-summary div {
  display: flex;

  flex-direction: column;

  gap: 3px;
}

.score-summary small {
  font-size: 8px;

  letter-spacing: 1px;

  color: #a18876;
}

.score-summary strong {
  font-size: 14px;

  color: #594133;
}


/* =========================================================
   STREAK
========================================================= */

.streak-section {
  margin-top: 55px;
}

.streak-counter {
  display: flex;

  align-items: center;

  gap: 6px;

  color: #a85339;
}

.streak-counter strong {
  font-size: 25px;
}

.streak-counter span {
  font-size: 11px;

  color: #8e725f;
}

.streak-card {
  position: relative;

  padding: 30px 35px;

  border-radius: 24px;

  background:
    rgba(255,249,243,.62);

  border:
    1px solid
    rgba(145,91,62,.13);
}

.streak-line {
  position: absolute;

  top: 48px;

  left: 80px;
  right: 80px;

  height: 2px;

  background:
    linear-gradient(
      90deg,
      #c66a46 0 71%,
      rgba(120,80,58,.12) 71%
    );
}

.streak-days {
  position: relative;

  display: grid;

  grid-template-columns:
    repeat(7,1fr);
}

.streak-day {
  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 9px;

  color: #9a806d;

  font-size: 10px;

  font-weight: 700;
}

.streak-dot {
  width: 34px;
  height: 34px;

  border-radius: 50%;

  display: grid;
  place-items: center;

  background:
    rgba(120,80,58,.08);

  color: transparent;

  border:
    2px solid
    rgba(120,80,58,.09);

  z-index: 2;
}

.streak-dot.active {
  color: white;

  background:
    linear-gradient(
      135deg,
      #c96b46,
      #a94d38
    );

  border-color: #c96b46;

  box-shadow:
    0 6px 20px
    rgba(191,91,59,.22);
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

.achievements-section {
  margin-top: 55px;
}

.achievement-count {
  display: flex;

  align-items: center;

  gap: 5px;

  padding: 9px 13px;

  border-radius: 13px;

  color: #a35238;

  background:
    rgba(198,106,69,.08);

  border:
    1px solid
    rgba(198,106,69,.15);

  font-size: 12px;
}

.achievement-count strong {
  font-size: 18px;
}

.achievement-count span {
  color: #927766;
}

.achievement-grid {
  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 15px;
}

.achievement-card {
  min-height: 190px;

  position: relative;

  overflow: hidden;

  padding: 23px;

  border-radius: 21px;

  border:
    1px solid
    rgba(133,88,62,.13);

  background:
    rgba(255,250,245,.7);

  transition: .35s ease;
}

.achievement-card.unlocked {
  background:
    linear-gradient(
      145deg,
      rgba(255,250,243,.95),
      rgba(250,227,207,.8)
    );
}

.achievement-card.unlocked:hover {
  transform:
    translateY(-8px);

  border-color:
    rgba(196,101,66,.34);

  box-shadow:
    0 18px 38px
    rgba(164,83,54,.15);
}

.achievement-card.locked {
  opacity: .58;
}

.achievement-glow {
  position: absolute;

  width: 120px;
  height: 120px;

  right: -55px;
  top: -55px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(216,139,96,.2),
      transparent 70%
    );

  transition: .4s ease;
}

.achievement-card:hover
.achievement-glow {
  transform:
    scale(1.6);
}

.achievement-icon {
  width: 52px;
  height: 52px;

  display: grid;
  place-items: center;

  border-radius: 16px;

  color: #b45b3e;

  background:
    linear-gradient(
      145deg,
      rgba(205,111,72,.14),
      rgba(239,177,126,.12)
    );

  margin-bottom: 16px;

  transition: .35s ease;
}

.achievement-card.unlocked:hover
.achievement-icon {
  transform:
    rotate(-8deg)
    scale(1.1);

  box-shadow:
    0 8px 22px
    rgba(188,91,58,.18);
}

.achievement-card.locked
.achievement-icon {
  color: #9b897b;

  background:
    rgba(118,90,72,.07);
}

.achievement-status {
  display: flex;

  align-items: center;

  gap: 5px;

  font-size: 8px;

  font-weight: 850;

  letter-spacing: 1.2px;

  color: #a65a41;
}

.achievement-status span {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #c86a46;
}

.achievement-card h3 {
  margin: 7px 0 5px;

  color: #4f392d;

  font-size: 17px;
}

.achievement-card p {
  margin: 0;

  color: #8a7160;

  font-size: 11px;

  line-height: 1.5;
}

.achievement-check {
  position: absolute;

  right: 17px;
  bottom: 17px;

  color: #bb6143;
}


/* =========================================================
   GOAL
========================================================= */

.goal-plan-grid {
  display: grid;

  grid-template-columns:
    1.25fr .75fr;

  gap: 18px;

  margin-top: 55px;
}

.large-card-heading {
  display: flex;

  align-items: center;

  gap: 13px;
}

.large-card-icon {
  width: 43px;
  height: 43px;

  border-radius: 13px;

  display: grid;
  place-items: center;

  color: #ad573d;

  background:
    rgba(199,107,69,.1);
}

.large-card-heading span {
  display: block;

  font-size: 9px;

  font-weight: 850;

  letter-spacing: 1.3px;

  color: #a08774;
}

.large-card-heading h3 {
  margin: 5px 0 0;

  font-size: 17px;

  color: #4e382b;
}

.goal-progress {
  margin-top: 26px;
}

.goal-progress-top {
  display: flex;

  justify-content: space-between;

  margin-bottom: 7px;

  color: #816957;

  font-size: 11px;
}

.goal-progress-top strong {
  color: #ad573d;
}

.goal-progress-track {
  height: 7px;

  overflow: hidden;

  border-radius: 10px;

  background:
    rgba(110,78,58,.09);
}

.goal-progress-fill {
  height: 100%;

  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      #c86a47,
      #e09b72
    );

  transition:
    width .8s ease;
}

.large-card-description {
  margin: 19px 0 25px;

  color: #826a59;

  font-size: 13px;

  line-height: 1.6;
}

.dashboard-action-button {
  margin-top: 20px;

  border:
    1px solid
    rgba(190,96,62,.2);

  background:
    rgba(255,249,243,.72);

  color: #a65038;

  padding: 10px 14px;

  border-radius: 11px;

  display: flex;

  align-items: center;

  gap: 8px;

  font-size: 11px;

  font-weight: 750;

  cursor: pointer;

  transition: .25s ease;
}

.dashboard-action-button:hover {
  transform:
    translateY(-3px);

  box-shadow:
    0 9px 25px
    rgba(177,83,53,.12);
}


/* =========================================================
   CHARTS
========================================================= */

.charts-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 18px;

  margin-top: 18px;
}

.chart-heading {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  color: #b35b40;
}

.chart-heading span {
  display: block;

  font-size: 9px;

  font-weight: 850;

  letter-spacing: 1.3px;

  color: #9c806b;
}

.chart-heading h3 {
  margin: 5px 0 0;

  font-size: 17px;

  color: #50392c;
}

.chart-container {
  height: 250px;

  margin-top: 22px;
}


/* =========================================================
   PERSPECTIVE
========================================================= */

.perspective-card {
  margin-top: 35px;

  padding: 25px 28px;

  display: flex;

  align-items: center;

  gap: 16px;

  border-radius: 21px;

  background:
    linear-gradient(
      120deg,
      rgba(255,246,235,.82),
      rgba(245,219,196,.56)
    );

  border:
    1px solid
    rgba(171,97,65,.14);
}

.perspective-icon {
  width: 45px;
  height: 45px;

  flex: 0 0 45px;

  display: grid;
  place-items: center;

  border-radius: 14px;

  color: #b25a3d;

  background:
    rgba(194,101,66,.1);
}

.perspective-card span {
  font-size: 9px;

  font-weight: 850;

  letter-spacing: 1.4px;

  color: #a47e66;
}

.perspective-card h3 {
  margin: 4px 0;

  font-size: 17px;

  color: #50382b;
}

.perspective-card p {
  margin: 0;

  color: #836a58;

  font-size: 11px;
}


/* =========================================================
   BOTTOM
========================================================= */

.dashboard-bottom {
  display: flex;

  justify-content: center;

  margin-top: 45px;
}

.bottom-logout {
  border: 0;

  background: transparent;

  color: #977d69;

  display: flex;

  align-items: center;

  gap: 7px;

  cursor: pointer;
}


/* =========================================================
   LOADING
========================================================= */

.dashboard-loading {
  min-height: 100vh;

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

  color: #4d382b;
}

.dashboard-loading h3 {
  margin: 24px 0 6px;
}

.dashboard-loading p {
  margin: 0;

  color: #856d5b;
}

.loading-orbit {
  width: 82px;
  height: 82px;

  border-radius: 50%;

  border:
    2px solid
    rgba(199,107,69,.2);

  border-top-color:
    #c76b45;

  display: grid;
  place-items: center;

  animation:
    loadingSpin 1.2s linear infinite;
}

.loading-core {
  width: 54px;
  height: 54px;

  border-radius: 50%;

  display: grid;
  place-items: center;

  background: #fff8f0;

  color: #c76b45;
}

@keyframes loadingSpin {
  to {
    transform:
      rotate(360deg);
  }
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1000px) {

  .dashboard-stat-grid {
    grid-template-columns:
      repeat(2,1fr);
  }

  .achievement-grid {
    grid-template-columns:
      repeat(2,1fr);
  }

  .productivity-score-card {
    grid-template-columns:
      230px 1fr;
  }

}


/* HEADER RESPONSIVE */

@media (max-width: 900px) {

  .dashboard-nav {
    flex-wrap: wrap;

    padding:
      15px 0;
  }

  .dashboard-nav-links {
    order: 3;

    width: 100%;

    justify-content: center;

    flex-wrap: wrap;
  }

}


/* PAGE RESPONSIVE */

@media (max-width: 800px) {

  .dashboard-hero {
    flex-direction: column;

    align-items: flex-start;
  }

  .productivity-score-card {
    grid-template-columns:
      1fr;
  }

  .goal-plan-grid,
  .charts-grid {
    grid-template-columns:
      1fr;
  }

}


@media (max-width: 600px) {

  .dashboard-main,
  .dashboard-nav {
    width:
      calc(100% - 24px);
  }

  .dashboard-nav {
    gap: 12px;
  }

  .dashboard-brand {
    font-size: 18px;
  }

  .dashboard-nav-links {
    gap: 3px;
  }

  .dashboard-nav-link {
    padding:
      8px 9px;

    font-size: 11px;
  }

  .dashboard-logout {
    padding:
      8px 10px;

    font-size: 11px;
  }

  .dashboard-stat-grid,
  .achievement-grid {
    grid-template-columns:
      1fr;
  }

  .dashboard-time-card {
    padding: 25px;
  }

  .time-card-value {
    font-size: 48px;
  }

  .time-card-ring {
    width: 100px;
    height: 100px;
  }

  .time-ring-inner {
    width: 78px;
    height: 78px;
  }

  .score-circle {
    width: 160px;
    height: 160px;
  }

  .score-circle::before {
    width: 144px;
    height: 144px;
  }

  .score-circle-inner strong {
    font-size: 45px;
  }

  .score-summary {
    grid-template-columns:
      1fr;
  }

  .feature-heading {
    flex-direction: column;

    align-items: flex-start;
  }

  .streak-card {
    padding:
      25px 10px;
  }

  .streak-line {
    left: 35px;
    right: 35px;
  }

  .streak-dot {
    width: 29px;
    height: 29px;
  }

}

`;