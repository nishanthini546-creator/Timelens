const API_BASE_URL = "http://localhost:5000/api";


/* ---------- API Request Helper ---------- */

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem("timelens_token");

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong."
    );
  }

  return data;
};


/* ==================================================
   DAILY ENTRY
   ================================================== */


/* ---------- Create Daily Entry ---------- */

export const createDailyEntry = async ({
  entryDate,
  dayType,
  mainGoal,
  goalCategory,
}) => {
  return apiRequest("/daily", {
    method: "POST",

    body: JSON.stringify({
      entryDate,
      dayType,
      mainGoal,
      goalCategory,
    }),
  });
};


/* ---------- Get Daily Entry By Date ---------- */

export const getDailyEntry = async (
  date
) => {
  return apiRequest(
    `/daily/${date}`
  );
};


/* ---------- Get Latest Daily Entry ---------- */

export const getLatestDailyEntry =
  async () => {
    return apiRequest(
      "/daily/latest"
    );
  };


/* ==================================================
   TASKS
   ================================================== */


/* ---------- Create Task ---------- */

export const createTask = async ({
  dailyEntryId,
  taskName,
  plannedMinutes,
  priority,
}) => {
  return apiRequest("/tasks", {
    method: "POST",

    body: JSON.stringify({
      dailyEntryId,
      taskName,
      plannedMinutes,
      priority,
    }),
  });
};


/* ---------- Get Tasks ---------- */

export const getTasks = async (
  dailyEntryId
) => {
  return apiRequest(
    `/tasks/${dailyEntryId}`
  );
};


/* ---------- Start Task ---------- */

export const startTask = async (
  taskId
) => {
  return apiRequest(
    `/tasks/${taskId}/start`,
    {
      method: "POST",
    }
  );
};


/* ---------- Complete Task ---------- */

export const completeTask = async (
  taskId
) => {
  return apiRequest(
    `/tasks/${taskId}/complete`,
    {
      method: "POST",
    }
  );
};


/* ==================================================
   ACTIVITIES
   ================================================== */


/* ---------- Start Activity ---------- */

export const startActivity = async ({
  dailyEntryId,
  activityName,
  category,
  activityType,
}) => {
  return apiRequest(
    "/activities/start",
    {
      method: "POST",

      body: JSON.stringify({
        dailyEntryId,
        activityName,
        category,
        activityType,
      }),
    }
  );
};


/* ---------- Get Activities ---------- */

export const getActivities = async (
  dailyEntryId
) => {
  return apiRequest(
    `/activities/${dailyEntryId}`
  );
};


/* ---------- Stop Activity ---------- */

export const stopActivity = async (
  activityId
) => {
  return apiRequest(
    `/activities/${activityId}/stop`,
    {
      method: "POST",
    }
  );
};


/* ==================================================
   ANALYTICS
   ================================================== */


/* ---------- Get Daily Analytics ---------- */

export const getDailyAnalytics =
  async (date) => {
    return apiRequest(
      `/analytics/today?date=${date}`
    );
  };


/* ---------- Get Weekly Analytics ---------- */

export const getWeeklyAnalytics =
  async (endDate) => {
    return apiRequest(
      `/analytics/week?endDate=${endDate}`
    );
  };


/* ==================================================
   DEFAULT EXPORT
   ================================================== */

export default apiRequest;