import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Play,
  Square,
  Check,
  Clock3,
  Target,
  RefreshCw,
  ListChecks,
  Activity,
  ArrowRight,
  Timer,
  Pause,
  RotateCcw,
  Sparkles,
  Lightbulb,
  LogOut,
} from "lucide-react";

import GlassCard from "../../components/glasscard";

import {
  createDailyEntry,
  updateDailyEntry,
  getDailyEntry,
  getLatestDailyEntry,
  createTask,
  getTasks,
  startTask,
  completeTask,
  startActivity,
  getActivities,
  stopActivity,
  getDailyAnalytics,
  getLocalTodayString,
} from "../../services/api";

const FOCUS_TIME = 60 * 60;


/* =========================================================
   SMART DAILY PLANNER - FRONTEND SAMPLE DATA
========================================================= */

const smartPlans = {
  Study: [
    {
      id: 1,
      title: "Practice Java / DSA",
      minutes: 60,
      priority: "High",
      reason:
        "A focused study block can help you make progress on an important learning goal.",
    },
    {
      id: 2,
      title: "Review today's class notes",
      minutes: 30,
      priority: "Medium",
      reason:
        "A short review keeps today's concepts fresh before moving to new topics.",
    },
    {
      id: 3,
      title: "Work on placement preparation",
      minutes: 45,
      priority: "High",
      reason:
        "Regular placement preparation builds consistent progress over time.",
    },
  ],

  Project: [
    {
      id: 4,
      title: "Work on the main project feature",
      minutes: 60,
      priority: "High",
      reason:
        "Starting with the main project task gives the day a clear productive direction.",
    },
    {
      id: 5,
      title: "Test and fix project issues",
      minutes: 45,
      priority: "Medium",
      reason:
        "A dedicated testing block helps improve project reliability.",
    },
    {
      id: 6,
      title: "Update project documentation",
      minutes: 30,
      priority: "Low",
      reason:
        "Keeping documentation updated makes the project easier to understand and maintain.",
    },
  ],

  Work: [
    {
      id: 7,
      title: "Complete the highest-priority work",
      minutes: 60,
      priority: "High",
      reason:
        "Starting with the most important responsibility helps reduce unfinished work.",
    },
    {
      id: 8,
      title: "Review pending work",
      minutes: 30,
      priority: "Medium",
      reason:
        "Reviewing pending items helps identify what needs attention next.",
    },
    {
      id: 9,
      title: "Organize tomorrow's priorities",
      minutes: 20,
      priority: "Low",
      reason:
        "A short planning session can make the next workday more organized.",
    },
  ],

  Personal: [
    {
      id: 10,
      title: "Complete an important personal task",
      minutes: 30,
      priority: "High",
      reason:
        "Finishing one important personal responsibility can create a sense of progress.",
    },
    {
      id: 11,
      title: "Organize your schedule",
      minutes: 20,
      priority: "Medium",
      reason:
        "A quick schedule review helps create a balanced day.",
    },
    {
      id: 12,
      title: "Take time for a healthy activity",
      minutes: 30,
      priority: "Medium",
      reason:
        "A planned break or healthy activity can help maintain balance.",
    },
  ],

  Other: [
    {
      id: 13,
      title: "Complete your most important task",
      minutes: 45,
      priority: "High",
      reason:
        "Choosing one important task gives the day a clear starting point.",
    },
    {
      id: 14,
      title: "Review your pending tasks",
      minutes: 30,
      priority: "Medium",
      reason:
        "Reviewing pending work helps you decide what deserves attention.",
    },
    {
      id: 15,
      title: "Plan the rest of your day",
      minutes: 20,
      priority: "Low",
      reason:
        "A simple plan can help you use the remaining time effectively.",
    },
  ],
};


/* =========================================================
   METRIC
========================================================= */

function Metric({ icon, label, value }) {
  return (
    <div className="plan-summary-card">
      <div className="plan-summary-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}


/* =========================================================
   PLAN & TRACK
========================================================= */

function PlanTrack() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [dayType, setDayType] =
    useState("Workday");

  const [goal, setGoal] =
    useState("");

  const [category, setCategory] =
    useState("Study");

  const [dailyEntryId, setDailyEntryId] =
    useState(null);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [savingPlan, setSavingPlan] =
    useState(false);

  const [tasks, setTasks] =
    useState([]);

  const [taskName, setTaskName] =
    useState("");

  const [taskMinutes, setTaskMinutes] =
    useState(60);

  const [taskPriority, setTaskPriority] =
    useState("Medium");

  const [activities, setActivities] =
    useState([]);

  const [activityName, setActivityName] =
    useState("");

  const [activityType, setActivityType] =
    useState("productive");

  const [analytics, setAnalytics] =
    useState(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  /* =========================================================
     SMART DAILY PLANNER
  ========================================================= */

  const [smartPlanIndex, setSmartPlanIndex] =
    useState(0);

  const [addingSmartTask, setAddingSmartTask] =
    useState(false);

  const currentSmartPlans =
    smartPlans[category] ||
    smartPlans.Other;

  const currentSmartPlan =
    currentSmartPlans[
      smartPlanIndex %
      currentSmartPlans.length
    ];


  const refreshSmartPlan = () => {
    setSmartPlanIndex(
      (current) =>
        (current + 1) %
        currentSmartPlans.length
    );

    setMessage(
      "A new smart suggestion is ready."
    );

    setError("");
  };


  const refreshEntryTasksAndAnalytics = async (entryId, dateStr) => {
    if (!entryId) return;
    const targetDate = dateStr || selectedDate || getLocalTodayString();

    const [taskData, activityData, analyticsData] = await Promise.all([
      getTasks(entryId).catch(() => ({ tasks: [] })),
      getActivities(entryId).catch(() => ({ activities: [] })),
      getDailyAnalytics(targetDate).catch(() => null),
    ]);

    setTasks(taskData?.tasks || taskData?.data || taskData || []);
    setActivities(
      activityData?.activities || activityData?.data || activityData || []
    );
    if (analyticsData) {
      setAnalytics(analyticsData?.analytics || analyticsData?.data || analyticsData);
    }
  };

  const addSmartTask = async () => {
    if (!dailyEntryId || !currentSmartPlan) {
      setError("Daily plan is not ready yet.");
      return;
    }

    try {
      setAddingSmartTask(true);
      setError("");
      setMessage("");

      await createTask({
        dailyEntryId,
        taskName: currentSmartPlan.title,
        plannedMinutes: currentSmartPlan.minutes,
        priority: currentSmartPlan.priority,
      });

      await refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate);

      setMessage(`"${currentSmartPlan.title}" added to your tasks.`);
    } catch (err) {
      console.error(err);
      setError("Unable to add the smart suggestion.");
    } finally {
      setAddingSmartTask(false);
    }
  };

  /* =========================================================
     FOCUS TIMER
  ========================================================= */

  const [focusSeconds, setFocusSeconds] = useState(FOCUS_TIME);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [selectedFocusTask, setSelectedFocusTask] = useState("");
  const [activeFocusActivityId, setActiveFocusActivityId] = useState(null);

  useEffect(() => {
    if (!focusRunning || focusPaused) {
      return;
    }

    const timer = setInterval(() => {
      setFocusSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);

          setFocusRunning(false);
          setFocusPaused(false);

          const matchedTask = tasks.find(
            (t) =>
              (t.name || t.task_name) === selectedFocusTask &&
              !t.completed &&
              t.status !== "completed"
          );

          if (matchedTask) {
            completeTask(
              matchedTask.task_id || matchedTask.id || matchedTask._id,
              60
            )
              .then(() =>
                refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate)
              )
              .catch(() => {});
          }

          if (activeFocusActivityId) {
            stopActivity(activeFocusActivityId, 60)
              .then(() =>
                refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate)
              )
              .catch(() => {});
            setActiveFocusActivityId(null);
          }

          setMessage("Focus session completed. Great work!");

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [focusRunning, focusPaused, selectedFocusTask, tasks, activeFocusActivityId, dailyEntryId, selectedDate]);

  const startFocusTimer = async () => {
    if (!selectedFocusTask) {
      setError("Please select a task before starting the focus session.");
      setMessage("");
      return;
    }

    if (focusSeconds === 0) {
      setFocusSeconds(FOCUS_TIME);
    }

    setFocusRunning(true);
    setFocusPaused(false);
    setError("");
    setMessage(`Focus session started for "${selectedFocusTask}".`);

    // Also mark the selected task as started in PostgreSQL and begin a focus activity
    try {
      const matchedTask = tasks.find(
        (t) => (t.name || t.task_name) === selectedFocusTask
      );
      if (
        matchedTask &&
        matchedTask.status !== "in_progress" &&
        matchedTask.status !== "completed"
      ) {
        await startTask(
          matchedTask.task_id || matchedTask.id || matchedTask._id
        );
      }
      if (dailyEntryId) {
        const startedAct = await startActivity({
          dailyEntryId,
          activityName: `Focus: ${selectedFocusTask}`,
          category: category || "Focus",
          activityType: "productive",
        });
        const actObj = startedAct?.activity || startedAct?.data || startedAct;
        if (actObj?.activity_id || actObj?.id) {
          setActiveFocusActivityId(actObj.activity_id || actObj.id);
        }
        await refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate);
      }
    } catch {
      // Non-blocking
    }
  };

  const pauseFocusTimer = () => {
    setFocusPaused(true);
    setMessage("Focus session paused.");
    setError("");
  };

  const resumeFocusTimer = () => {
    setFocusPaused(false);
    setMessage("Focus session resumed.");
    setError("");
  };

  const resetFocusTimer = () => {
    setFocusRunning(false);
    setFocusPaused(false);
    setFocusSeconds(FOCUS_TIME);
    setMessage("Focus timer reset.");
    setError("");
  };

  const stopFocusTimer = async () => {
    const elapsedMinutes = Math.max(
      1,
      Math.round((FOCUS_TIME - focusSeconds) / 60)
    );
    setFocusRunning(false);
    setFocusPaused(false);
    setFocusSeconds(FOCUS_TIME);
    setMessage("Focus session stopped.");
    setError("");

    if (activeFocusActivityId) {
      try {
        await stopActivity(activeFocusActivityId, elapsedMinutes);
        setActiveFocusActivityId(null);
        await refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate);
      } catch {
        // Ignore
      }
    }
  };

  const formatFocusTime = () => {
    const hours = Math.floor(focusSeconds / 3600);
    const minutes = Math.floor((focusSeconds % 3600) / 60);
    const seconds = focusSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  /* =========================================================
     LOAD DAILY DATA
  ========================================================= */

  const loadToday = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("timelens_user");
      const token = localStorage.getItem("timelens_token");

      if (!storedUser || !token) {
        navigate("/auth");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const today = getLocalTodayString();
      setSelectedDate(today);

      let entryResponse = null;

      try {
        entryResponse = await getDailyEntry(today);
      } catch {
        entryResponse = null;
      }

      if (!entryResponse) {
        entryResponse = await createDailyEntry({
          entryDate: today,
          dayType: "Workday",
          mainGoal: "",
          goalCategory: "Study",
        });
      }

      const entryData =
        entryResponse?.entry || entryResponse?.data || entryResponse;

      const entryId =
        entryData?.daily_entry_id || entryData?.id || entryData?._id || null;

      setDailyEntryId(entryId);
      setDayType(entryData?.dayType || entryData?.day_type || "Workday");
      setGoal(entryData?.goal || entryData?.main_goal || "");
      setCategory(
        entryData?.category || entryData?.goal_category || "Study"
      );

      if (entryId) {
        await refreshEntryTasksAndAnalytics(entryId, today);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your daily plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("timelens_token");
    localStorage.removeItem("timelens_user");
    navigate("/auth");
  };

  /* =========================================================
     SAVE DAILY PLAN
  ========================================================= */

  const saveDailyPlan = async () => {
    try {
      setSavingPlan(true);
      setError("");
      setMessage("");

      const targetDate = selectedDate || getLocalTodayString();

      const saved = await updateDailyEntry({
        entryDate: targetDate,
        dayType,
        mainGoal: goal,
        goalCategory: category,
      });

      const savedEntry = saved?.entry || saved?.data || saved;
      const entryId =
        savedEntry?.daily_entry_id ||
        savedEntry?.id ||
        savedEntry?._id ||
        dailyEntryId;

      if (entryId) {
        setDailyEntryId(entryId);
        await refreshEntryTasksAndAnalytics(entryId, targetDate);
      }

      setMessage("Daily plan saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save your daily plan.");
    } finally {
      setSavingPlan(false);
    }
  };

  /* =========================================================
     TASKS
  ========================================================= */

  const addTask = async () => {
    if (!taskName.trim()) {
      setError("Please enter a task name.");
      return;
    }

    if (!dailyEntryId) {
      setError("Daily plan is not ready yet.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await createTask({
        dailyEntryId,
        taskName: taskName.trim(),
        plannedMinutes: Number(taskMinutes) || 30,
        priority: taskPriority,
      });

      setTaskName("");
      setTaskMinutes(60);
      setTaskPriority("Medium");

      await refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate);

      setMessage("Task added successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to add the task.");
    }
  };

  const handleStartTask = async (task) => {
    try {
      const id = task.task_id || task.id || task._id;
      await startTask(id);
      await refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate);
      setMessage(`Started "${task.name || task.task_name}".`);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to start the task.");
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      const id = task.task_id || task.id || task._id;
      await completeTask(id);
      await refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate);
      setMessage(`"${task.name || task.task_name}" completed.`);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to complete the task.");
    }
  };

  /* =========================================================
     ACTIVITIES
  ========================================================= */

  const handleStartActivity = async () => {
    if (!activityName.trim()) {
      setError("Please enter an activity name.");
      return;
    }

    if (!dailyEntryId) {
      setError("Daily plan is not ready yet.");
      return;
    }

    try {
      await startActivity({
        dailyEntryId,
        activityName: activityName.trim(),
        category: category || "General",
        activityType:
          activityType === "recreation" ? "recreational" : activityType,
      });

      setActivityName("");

      await refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate);

      setMessage("Activity started.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to start activity.");
    }
  };

  const handleStopActivity = async (activity) => {
    try {
      const id = activity.activity_id || activity.id || activity._id;
      await stopActivity(id);
      await refreshEntryTasksAndAnalytics(dailyEntryId, selectedDate);
      setMessage("Activity stopped.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to stop activity.");
    }
  };


  /* =========================================================
     SUMMARY VALUES
  ========================================================= */

  const completedTasks =
    tasks.filter(
      (task) =>
        task.completed === true ||
        task.status === "completed" ||
        task.status === "Completed"
    ).length;

  const totalTasks =
    tasks.length;

  const productiveActivities =
    activities.filter(
      (activity) =>
        activity.type ===
          "productive" ||
        activity.activityType ===
          "productive"
    ).length;

  const totalPlannedMinutes =
    tasks.reduce(
      (
        total,
        task
      ) =>
        total +
        Number(
          task.minutes ||
          task.duration ||
          0
        ),
      0
    );


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="timelens-page plantrack-page">

        <div className="plantrack-container">

          <div className="analysis-empty">

            <RefreshCw size={20} />

            Loading your daily plan...

          </div>

        </div>

      </div>
    );
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="timelens-page plantrack-page">

      {/* =====================================================
          SAME DASHBOARD HEADER
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


        {/* NAVIGATION */}

        <div className="dashboard-nav-links">

          <button
            type="button"
            className="dashboard-nav-link"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>


          <button
            type="button"
            className="dashboard-nav-link active"
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


      <main className="plantrack-container">


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="plantrack-heading">

          <div>

            <span className="warm-section-label">
              PLAN & TRACK
            </span>

            <h1>
              Make today count.
            </h1>

            <p>
              Plan your priorities,
              focus on meaningful work,
              and track how your time
              is spent.
            </p>

          </div>


          <div className="recorded-date">

            <Clock3 size={17} />

            {selectedDate}

          </div>

        </div>


        {/* ===================================================
            MESSAGES
        =================================================== */}

        {error && (
          <div className="warm-message error">
            {error}
          </div>
        )}

        {message && (
          <div className="warm-message">
            {message}
          </div>
        )}


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="plan-summary-grid">

          <Metric
            icon={
              <ListChecks size={20} />
            }
            label="Tasks"
            value={`${completedTasks}/${totalTasks}`}
          />


          <Metric
            icon={
              <Clock3 size={20} />
            }
            label="Planned Time"
            value={`${totalPlannedMinutes} min`}
          />


          <Metric
            icon={
              <Activity size={20} />
            }
            label="Activities"
            value={activities.length}
          />


          <Metric
            icon={
              <Target size={20} />
            }
            label="Productive"
            value={productiveActivities}
          />

        </div>


        {/* ===================================================
            SMART DAILY PLANNER
        =================================================== */}

        <GlassCard
          className="warm-plan-card smart-planner-card"
        >

          <div className="warm-card-inner">

            <div className="warm-section-heading">

              <div>

                <span className="warm-section-label">
                  SMART PLANNER
                </span>

                <h2>
                  Plan your day smarter.
                </h2>

                <p className="smart-planner-description">
                  Based on your selected category,
                  here is a suggested task you can
                  add to today's plan.
                </p>

              </div>

              <Sparkles size={25} />

            </div>


            <div className="smart-planner-suggestion">

              <div className="smart-planner-icon">
                <Lightbulb size={24} />
              </div>


              <div className="smart-planner-content">

                <span className="smart-planner-label">
                  RECOMMENDED FOR{" "}
                  {category.toUpperCase()}
                </span>

                <h3>
                  {currentSmartPlan.title}
                </h3>

                <p>
                  {currentSmartPlan.reason}
                </p>


                <div className="smart-planner-meta">

                  <span>
                    <Clock3 size={14} />

                    {currentSmartPlan.minutes} min
                  </span>


                  <span
                    className={`smart-priority ${currentSmartPlan.priority.toLowerCase()}`}
                  >
                    {currentSmartPlan.priority} Priority
                  </span>

                </div>

              </div>


              <div className="smart-planner-actions">

                <button
                  className="warm-primary-button"
                  onClick={addSmartTask}
                  disabled={
                    addingSmartTask ||
                    !dailyEntryId
                  }
                >

                  <Plus size={17} />

                  {addingSmartTask
                    ? "Adding..."
                    : "Add to My Tasks"}

                </button>


                <button
                  className="warm-secondary-button"
                  onClick={refreshSmartPlan}
                >

                  <RefreshCw size={16} />

                  Another Suggestion

                </button>

              </div>

            </div>


            <div className="smart-planner-note">

              <Sparkles size={15} />

              Smart suggestions adapt to your selected daily goal category and save directly to your plan.

            </div>

          </div>

        </GlassCard>


        {/* ===================================================
            FOCUS TIMER
        =================================================== */}

        <GlassCard
          className="warm-plan-card focus-timer-card"
        >

          <div className="warm-card-inner">

            <div className="warm-section-heading">

              <div>

                <span className="warm-section-label">
                  FOCUS MODE
                </span>

                <h2>
                  One hour. One focus.
                </h2>

              </div>

              <Timer size={25} />

            </div>


            <div className="focus-timer">

              <div className="focus-task-selector">

                <label htmlFor="focusTask">
                  What are you focusing on?
                </label>


                <select
                  id="focusTask"
                  className="warm-input"
                  value={selectedFocusTask}
                  onChange={(e) =>
                    setSelectedFocusTask(
                      e.target.value
                    )
                  }
                  disabled={focusRunning}
                >

                  <option value="">
                    Select a planned task
                  </option>

                  {tasks.map(
                    (task) => (
                      <option
                        key={
                          task.id ||
                          task._id
                        }
                        value={
                          task.name
                        }
                      >
                        {task.name}
                      </option>
                    )
                  )}

                </select>


                {tasks.length === 0 && (
                  <p className="focus-task-hint">
                    Add a planned task below
                    first, then select it here.
                  </p>
                )}

              </div>


              {selectedFocusTask && (
                <div className="focus-selected-task">

                  <span>
                    FOCUSING ON
                  </span>

                  <strong>
                    {selectedFocusTask}
                  </strong>

                </div>
              )}


              <div className="focus-timer-circle">

                <div className="focus-timer-time">
                  {formatFocusTime()}
                </div>

                <span>

                  {focusRunning
                    ? focusPaused
                      ? "PAUSED"
                      : "FOCUSING"
                    : "READY"}

                </span>

              </div>


              <div className="focus-timer-controls">

                {!focusRunning && (
                  <button
                    className="warm-primary-button"
                    onClick={
                      startFocusTimer
                    }
                    disabled={
                      !selectedFocusTask
                    }
                  >

                    <Play size={17} />

                    Start 1 Hour Focus

                  </button>
                )}


                {focusRunning &&
                  !focusPaused && (
                    <button
                      className="warm-secondary-button"
                      onClick={
                        pauseFocusTimer
                      }
                    >

                      <Pause size={17} />

                      Pause

                    </button>
                  )}


                {focusRunning &&
                  focusPaused && (
                    <button
                      className="warm-primary-button"
                      onClick={
                        resumeFocusTimer
                      }
                    >

                      <Play size={17} />

                      Resume

                    </button>
                  )}


                {focusRunning && (
                  <button
                    className="warm-secondary-button"
                    onClick={
                      stopFocusTimer
                    }
                  >

                    <Square size={16} />

                    Stop

                  </button>
                )}


                {!focusRunning &&
                  focusSeconds !==
                    FOCUS_TIME && (
                    <button
                      className="warm-secondary-button"
                      onClick={
                        resetFocusTimer
                      }
                    >

                      <RotateCcw size={16} />

                      Reset

                    </button>
                  )}

              </div>


              <p className="focus-timer-note">
                Select one of your planned tasks
                and use this one-hour session to
                work on it without distractions.
              </p>

            </div>

          </div>

        </GlassCard>


        {/* ===================================================
            DAY TYPE
        =================================================== */}

        <GlassCard className="warm-plan-card">

          <div className="warm-card-inner">

            <div className="warm-section-heading">

              <div>

                <span className="warm-section-label">
                  TODAY
                </span>

                <h2>
                  How does today look?
                </h2>

              </div>

            </div>


            <div className="day-type-grid">

              {[
                "Workday",
                "Study",
                "Weekend",
                "Holiday",
              ].map(
                (type) => (
                  <button
                    key={type}
                    className={`day-type-option ${
                      dayType === type
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setDayType(type)
                    }
                  >
                    {type}
                  </button>
                )
              )}

            </div>

          </div>

        </GlassCard>


        {/* ===================================================
            GOAL
        =================================================== */}

        <GlassCard className="warm-plan-card">

          <div className="warm-card-inner">

            <div className="warm-section-heading">

              <div>

                <span className="warm-section-label">
                  DAILY GOAL
                </span>

                <h2>
                  What matters most today?
                </h2>

              </div>

              <Target size={25} />

            </div>


            <div className="goal-form">

              <input
                className="warm-input"
                type="text"
                placeholder="Example: Complete Java practice and project work"
                value={goal}
                onChange={(e) =>
                  setGoal(
                    e.target.value
                  )
                }
              />


              <select
                className="warm-input"
                value={category}
                onChange={(e) => {
                  setCategory(
                    e.target.value
                  );

                  setSmartPlanIndex(0);
                }}
              >

                <option value="Study">
                  Study
                </option>

                <option value="Project">
                  Project
                </option>

                <option value="Work">
                  Work
                </option>

                <option value="Personal">
                  Personal
                </option>

                <option value="Other">
                  Other
                </option>

              </select>


              <button
                className="warm-primary-button"
                onClick={
                  saveDailyPlan
                }
                disabled={
                  savingPlan
                }
              >

                {savingPlan
                  ? "Saving..."
                  : "Save Daily Plan"}

              </button>

            </div>

          </div>

        </GlassCard>


        {/* ===================================================
            PLANNED TASKS
        =================================================== */}

        <GlassCard className="warm-plan-card">

          <div className="warm-card-inner">

            <div className="warm-section-heading">

              <div>

                <span className="warm-section-label">
                  TASKS
                </span>

                <h2>
                  Planned tasks
                </h2>

              </div>

              <ListChecks size={25} />

            </div>


            <div className="task-form">

              <input
                className="warm-input"
                type="text"
                placeholder="Task name"
                value={taskName}
                onChange={(e) =>
                  setTaskName(
                    e.target.value
                  )
                }
              />


              <input
                className="warm-input"
                type="number"
                min="1"
                placeholder="Minutes"
                value={taskMinutes}
                onChange={(e) =>
                  setTaskMinutes(
                    e.target.value
                  )
                }
              />


              <select
                className="warm-input"
                value={taskPriority}
                onChange={(e) =>
                  setTaskPriority(
                    e.target.value
                  )
                }
              >

                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

              </select>


              <button
                className="warm-primary-button"
                onClick={addTask}
              >

                <Plus size={17} />

                Add Task

              </button>

            </div>


            {tasks.length > 0 ? (

              <div className="warm-list">

                {tasks.map(
                  (task) => {

                    const completed =
                      task.completed ===
                        true ||
                      task.status ===
                        "completed" ||
                      task.status ===
                        "Completed";

                    const running =
                      task.status === "in_progress" ||
                      task.status === "running" ||
                      task.status === "Running" ||
                      task.started === true;

                    return (
                      <div
                        className={`task-row ${
                          completed
                            ? "completed-task"
                            : ""
                        }`}
                        key={
                          task.task_id ||
                          task.id ||
                          task._id
                        }
                      >

                        <div className="task-info">

                          <strong>
                            {task.name || task.task_name}
                          </strong>


                          <div className="task-meta">

                            <span>

                              <Clock3 size={13} />

                              {task.minutes ||
                                task.planned_minutes ||
                                task.duration ||
                                0}{" "}
                              min

                            </span>


                            <span>
                              {task.priority ||
                                "Medium"}
                            </span>

                            {running && (
                              <span className="activity-status">
                                In Progress
                              </span>
                            )}

                          </div>

                        </div>


                        <div className="task-actions">

                          {!completed &&
                            !running && (
                              <button
                                className="warm-icon-button"
                                onClick={() =>
                                  handleStartTask(
                                    task
                                  )
                                }
                                title="Start task"
                              >
                                <Play
                                  size={16}
                                />
                              </button>
                            )}


                          {!completed && (
                            <button
                              className="warm-icon-button"
                              onClick={() =>
                                handleCompleteTask(
                                  task
                                )
                              }
                              title="Complete task"
                            >
                              <Check
                                size={17}
                              />
                            </button>
                          )}


                          {completed && (
                            <span className="done-label">

                              <Check
                                size={15}
                              />

                              Done

                            </span>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="analysis-empty">

                No planned tasks yet.
                Add your first task above.

              </div>

            )}

          </div>

        </GlassCard>


        {/* ===================================================
            DIGITAL ACTIVITY
        =================================================== */}

        <GlassCard className="warm-plan-card">

          <div className="warm-card-inner">

            <div className="warm-section-heading">

              <div>

                <span className="warm-section-label">
                  ACTIVITY
                </span>

                <h2>
                  Track your activity
                </h2>

              </div>

              <Activity size={25} />

            </div>


            <div className="activity-form">

              <div className="activity-left">

                <input
                  className="warm-input"
                  type="text"
                  placeholder="Activity name"
                  value={activityName}
                  onChange={(e) =>
                    setActivityName(
                      e.target.value
                    )
                  }
                />


                <select
                  className="warm-input"
                  value={activityType}
                  onChange={(e) =>
                    setActivityType(
                      e.target.value
                    )
                  }
                >

                  <option value="productive">
                    Productive
                  </option>

                  <option value="recreational">
                    Recreation
                  </option>

                </select>


                <button
                  className="warm-primary-button"
                  onClick={
                    handleStartActivity
                  }
                >

                  <Play size={17} />

                  Start Activity

                </button>

              </div>

            </div>


            {activities.length > 0 && (

              <div className="warm-list">

                {activities.map(
                  (activity) => {

                    const active =
                      activity.end_time === null ||
                      activity.status ===
                        "running" ||
                      activity.status ===
                        "Running" ||
                      activity.active ===
                        true;

                    return (
                      <div
                        className="task-row"
                        key={
                          activity.activity_id ||
                          activity.id ||
                          activity._id
                        }
                      >

                        <div className="task-info">

                          <strong>
                            {activity.name || activity.activity_name}
                          </strong>


                          <div className="task-meta">

                            <span
                              className={
                                (activity.type || activity.activity_type) ===
                                "productive"
                                  ? "productive-text"
                                  : "recreation-text"
                              }
                            >
                              {activity.type ||
                                activity.activity_type ||
                                activity.activityType}
                            </span>

                            <span>
                              <Clock3 size={13} />
                              {activity.duration_minutes ||
                                activity.duration ||
                                1}{" "}
                              min
                            </span>

                            {active && (
                              <span className="activity-status">
                                Running
                              </span>
                            )}

                          </div>

                        </div>


                        <div className="activity-right">

                          {active ? (

                            <button
                              className="warm-secondary-button"
                              onClick={() =>
                                handleStopActivity(
                                  activity
                                )
                              }
                            >

                              <Square
                                size={15}
                              />

                              Stop

                            </button>

                          ) : (

                            <span className="done-label">
                              Recorded
                            </span>

                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </GlassCard>


        {/* ===================================================
            DAILY ANALYSIS
        =================================================== */}

        <GlassCard className="warm-plan-card daily-analysis-warm">

          <div className="warm-card-inner">

            <div className="warm-section-heading">

              <div>

                <span className="warm-section-label">
                  ANALYSIS
                </span>

                <h2>
                  Today's analysis
                </h2>

              </div>

              <ArrowRight size={23} />

            </div>


            {analytics ? (

              <div className="analysis-metrics">

                <div className="analysis-metric">

                  <span>
                    Productive Time
                  </span>

                  <strong>
                    {analytics.productiveMinutes ??
                      analytics.productiveTime ??
                      0}{" "}
                    min
                  </strong>

                </div>


                <div className="analysis-metric">

                  <span>
                    Recreation Time
                  </span>

                  <strong>
                    {analytics.recreationMinutes ??
                      analytics.recreationTime ??
                      0}{" "}
                    min
                  </strong>

                </div>


                <div className="analysis-metric">

                  <span>
                    Completed Tasks
                  </span>

                  <strong>
                    {analytics.completedTasks ??
                      completedTasks}
                  </strong>

                </div>


                <div className="analysis-metric">

                  <span>
                    Productivity Score
                  </span>

                  <strong>
                    {analytics.productivityScore ??
                      analytics.score ??
                      "--"}
                  </strong>

                </div>

              </div>

            ) : (

              <div className="analysis-empty">

                Complete some tasks or
                activities to see your
                daily analysis.

              </div>

            )}

          </div>

        </GlassCard>

      </main>


      {/* =====================================================
          SAME HEADER CSS AS DASHBOARD
      ===================================================== */}

      <style>{`

        .dashboard-nav {
          width: min(1180px, calc(100% - 40px));
          min-height: 76px;
          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          position: relative;
          z-index: 20;
        }

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


        /* ================================================
           PLAN TRACK HEADER SPACING
        ================================================= */

        .plantrack-page {
          min-height: 100vh;
        }


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


        @media (max-width: 600px) {

          .dashboard-nav {
            width:
              calc(100% - 24px);

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

        }

      `}</style>

    </div>
  );
}

export default PlanTrack;