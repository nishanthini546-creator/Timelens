const {
  createTask,
  getTasks,
  startTask,
  completeTask,
} = require("../models/taskmodel");


/* ---------- Create Task ---------- */

const create = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      dailyEntryId,
      taskName,
      plannedMinutes,
      priority,
    } = req.body;

    if (!dailyEntryId || !taskName || !plannedMinutes) {
      return res.status(400).json({
        success: false,
        message:
          "Daily entry, task name and planned time are required.",
      });
    }

    const plannedTime = Number(plannedMinutes);

    if (!Number.isInteger(plannedTime) || plannedTime <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Planned time must be a positive whole number of minutes.",
      });
    }

    const task = await createTask({
      userId,
      dailyEntryId,
      taskName: taskName.trim(),
      plannedMinutes: plannedTime,
      priority: priority || "Medium",
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
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

    const tasks = await getTasks(
      userId,
      dailyEntryId
    );

    res.json({
      success: true,
      tasks,
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

    const task = await startTask(
      userId,
      taskId
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found or task has already been started.",
      });
    }

    res.json({
      success: true,
      message: "Task started.",
      task,
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

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const task = await completeTask(
      userId,
      taskId
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found or task has not been started.",
      });
    }

    res.json({
      success: true,
      message: "Task completed.",
      task,
    });

  } catch (error) {
    console.error("Complete task error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to complete task.",
    });
  }
};


/* ---------- Export ---------- */

module.exports = {
  create,
  getAll,
  start,
  complete,
};