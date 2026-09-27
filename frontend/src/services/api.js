const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:5000/api";

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL = (
  rawEnvUrl &&
  !(import.meta.env.PROD && rawEnvUrl.includes("localhost"))
    ? rawEnvUrl
    : DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

/* ---------- Local Date Helper ---------- */

export const getLocalTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/* ---------- API Request Helper ---------- */

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("timelens_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      !endpoint.startsWith("/auth/login") &&
      !endpoint.startsWith("/auth/register")
    ) {
      localStorage.removeItem("timelens_token");
    }
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

/* ==================================================
   AUTHENTICATION
   ================================================== */

export const registerUser = async ({ name, email, password }) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
};

export const loginUser = async ({ email, password }) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const getCurrentUser = async () => {
  return apiRequest("/auth/me");
};

export const updateUserProfile = async ({ name }) => {
  return apiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
};

/* ==================================================
   DAILY ENTRY
   ================================================== */

export const createDailyEntry = async (payload = {}) => {
  const entryDate =
    payload.entryDate || payload.date || getLocalTodayString();
  const dayType = payload.dayType || payload.day_type || "Workday";
  const mainGoal =
    payload.mainGoal !== undefined
      ? payload.mainGoal
      : payload.goal !== undefined
      ? payload.goal
      : "";
  const goalCategory =
    payload.goalCategory || payload.category || "Study";

  return apiRequest("/daily", {
    method: "POST",
    body: JSON.stringify({
      entryDate,
      date: entryDate,
      dayType,
      mainGoal,
      goal: mainGoal,
      goalCategory,
      category: goalCategory,
    }),
  });
};

export const updateDailyEntry = async (payload = {}) => {
  const entryDate =
    payload.entryDate || payload.date || getLocalTodayString();
  const dayType = payload.dayType || payload.day_type || "Workday";
  const mainGoal =
    payload.mainGoal !== undefined
      ? payload.mainGoal
      : payload.goal !== undefined
      ? payload.goal
      : "";
  const goalCategory =
    payload.goalCategory || payload.category || "Study";

  return apiRequest(`/daily/${entryDate}`, {
    method: "PUT",
    body: JSON.stringify({
      entryDate,
      date: entryDate,
      dayType,
      mainGoal,
      goal: mainGoal,
      goalCategory,
      category: goalCategory,
    }),
  });
};

export const getDailyEntry = async (date) => {
  const targetDate = date || getLocalTodayString();
  return apiRequest(`/daily/${targetDate}`);
};

export const getLatestDailyEntry = async () => {
  return apiRequest("/daily/latest");
};

/* ==================================================
   TASKS
   ================================================== */

export const createTask = async (arg1, arg2) => {
  let dailyEntryId;
  let taskName;
  let plannedMinutes;
  let priority;

  if (arg2 && typeof arg2 === "object") {
    dailyEntryId = arg1;
    taskName = arg2.taskName || arg2.name || arg2.title;
    plannedMinutes =
      arg2.plannedMinutes ?? arg2.minutes ?? arg2.duration ?? 30;
    priority = arg2.priority || "Medium";
  } else if (arg1 && typeof arg1 === "object") {
    dailyEntryId = arg1.dailyEntryId || arg1.daily_entry_id;
    taskName = arg1.taskName || arg1.name || arg1.title;
    plannedMinutes =
      arg1.plannedMinutes ?? arg1.minutes ?? arg1.duration ?? 30;
    priority = arg1.priority || "Medium";
  }

  return apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify({
      dailyEntryId,
      taskName,
      name: taskName,
      plannedMinutes: Number(plannedMinutes),
      minutes: Number(plannedMinutes),
      priority: priority || "Medium",
    }),
  });
};

export const getTasks = async (dailyEntryId) => {
  return apiRequest(`/tasks/${dailyEntryId}`);
};

export const startTask = async (taskId) => {
  return apiRequest(`/tasks/${taskId}/start`, {
    method: "POST",
  });
};

export const completeTask = async (taskId, actualMinutes = null) => {
  return apiRequest(`/tasks/${taskId}/complete`, {
    method: "POST",
    body: JSON.stringify(
      actualMinutes ? { actualMinutes: Number(actualMinutes) } : {}
    ),
  });
};

export const deleteTask = async (taskId) => {
  return apiRequest(`/tasks/${taskId}`, {
    method: "DELETE",
  });
};

/* ==================================================
   ACTIVITIES
   ================================================== */

export const startActivity = async (arg1, arg2) => {
  let dailyEntryId;
  let activityName;
  let category;
  let activityType;

  if (arg2 && typeof arg2 === "object") {
    dailyEntryId = arg1;
    activityName = arg2.activityName || arg2.name || arg2.title;
    activityType = arg2.activityType || arg2.type || "productive";
    category =
      arg2.category ||
      (activityType === "recreation" || activityType === "recreational"
        ? "Recreation"
        : "Focus");
  } else if (arg1 && typeof arg1 === "object") {
    dailyEntryId = arg1.dailyEntryId || arg1.daily_entry_id;
    activityName = arg1.activityName || arg1.name || arg1.title;
    activityType = arg1.activityType || arg1.type || "productive";
    category =
      arg1.category ||
      (activityType === "recreation" || activityType === "recreational"
        ? "Recreation"
        : "Focus");
  }

  return apiRequest("/activities/start", {
    method: "POST",
    body: JSON.stringify({
      dailyEntryId,
      activityName,
      name: activityName,
      category,
      activityType:
        activityType === "recreation" ? "recreational" : activityType,
    }),
  });
};

export const getActivities = async (dailyEntryId) => {
  return apiRequest(`/activities/${dailyEntryId}`);
};

export const stopActivity = async (activityId, durationMinutes = null) => {
  return apiRequest(`/activities/${activityId}/stop`, {
    method: "POST",
    body: JSON.stringify(
      durationMinutes ? { durationMinutes: Number(durationMinutes) } : {}
    ),
  });
};

export const deleteActivity = async (activityId) => {
  return apiRequest(`/activities/${activityId}`, {
    method: "DELETE",
  });
};

/* ==================================================
   GOALS
   ================================================== */

export const getGoals = async () => {
  return apiRequest("/goals");
};

export const createGoal = async ({ goalName, title, category }) => {
  const resolvedName = goalName || title;
  return apiRequest("/goals", {
    method: "POST",
    body: JSON.stringify({
      goalName: resolvedName,
      title: resolvedName,
      category: category || "Study",
    }),
  });
};

export const updateGoalStatus = async (goalId, status) => {
  return apiRequest(`/goals/${goalId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

export const deleteGoal = async (goalId) => {
  return apiRequest(`/goals/${goalId}`, {
    method: "DELETE",
  });
};

/* ==================================================
   NOTIFICATIONS
   ================================================== */

export const getNotifications = async () => {
  return apiRequest("/notifications");
};

export const createNotification = async ({ notificationType, message }) => {
  return apiRequest("/notifications", {
    method: "POST",
    body: JSON.stringify({
      notificationType: notificationType || "general",
      message,
    }),
  });
};

export const markNotificationRead = async (notificationId) => {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
};

/* ==================================================
   ANALYTICS
   ================================================== */

export const getDailyAnalytics = async (date) => {
  const queryDate =
    date && date !== "undefined" ? date : getLocalTodayString();
  return apiRequest(`/analytics/today?date=${queryDate}`);
};

export const getWeeklyAnalytics = async (endDate) => {
  const queryEndDate =
    endDate && endDate !== "undefined" ? endDate : getLocalTodayString();
  return apiRequest(`/analytics/week?endDate=${queryEndDate}`);
};

export const getMonthlyAnalytics = async (year, month) => {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || now.getMonth() + 1;
  return apiRequest(`/analytics/month?year=${y}&month=${m}`);
};

export default apiRequest;