let taskModelModule;
try {
  taskModelModule = require("../models/taskmodel");
} catch {
  taskModelModule = require("../models/taskModel");
}

const {
  createTask,
  getTasks,
  startTask,
  completeTask,
  deleteTask,
} = taskModelModule;
const { createNotification } = require("../models/notificationModel");

/* ---------- Create Task ---------- */

const create = async (req, res) => {
  try {
    const userId = req.user.userId;

    const dailyEntryId =
      req.body.dailyEntryId ||
      req.body.daily_entry_id ||
      req.body.entryId;

    const taskName =
      req.body.taskName ||
      req.body.name ||
      req.body.title;

    const plannedMinutes =
      req.body.plannedMinutes ??
      req.body.minutes ??
      req.body.duration ??
      30;

    const priority = req.body.priority || "Medium";

    if (!dailyEntryId || !taskName) {
      return res.status(400).json({
        success: false,
        message: "Daily entry and task name are required.",
      });
    }

    const plannedTime = Math.max(1, Math.round(Number(plannedMinutes) || 30));

    const task = await createTask({
      userId,
      dailyEntryId: Number(dailyEntryId),
      taskName: String(taskName).trim(),
      plannedMinutes: plannedTime,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create task.",
    });
  }
};

/* ---------- Get Tasks ---------- */

const getAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dailyEntryId } = req.params;

    if (!dailyEntryId) {
      return res.status(400).json({
        success: false,
        message: "Daily entry ID is required.",
      });
    }

    const tasks = await getTasks(userId, Number(dailyEntryId));

    res.json({
      success: true,
      tasks,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve tasks.",
    });
  }
};

/* ---------- Start Task ---------- */

const start = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const task = await startTask(userId, Number(taskId));

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or already completed.",
      });
    }

    res.json({
      success: true,
      message: "Task started.",
      task,
      data: task,
    });
  } catch (error) {
    console.error("Start task error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to start task.",
    });
  }
};

/* ---------- Complete Task ---------- */

const complete = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;
    const focusMinutes = req.body?.actualMinutes || req.body?.minutes || null;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const task = await completeTask(userId, Number(taskId), focusMinutes);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or already completed.",
      });
    }

    try {
      await createNotification({
        userId,
        notificationType: "task_completed",
        message: `Completed task "${task.task_name}" (${task.actual_minutes || task.planned_minutes} min).`,
      });
    } catch {
      // Non-blocking notification
    }

    res.json({
      success: true,
      message: "Task completed.",
      task,
      data: task,
    });
  } catch (error) {
    console.error("Complete task error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to complete task.",
    });
  }
};

/* ---------- Delete Task ---------- */

const remove = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;

    const deleted = await deleteTask(userId, Number(taskId));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.json({
      success: true,
      message: "Task removed.",
      task: deleted,
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete task.",
    });
  }
};

module.exports = {
  create,
  getAll,
  start,
  complete,
  remove,
};