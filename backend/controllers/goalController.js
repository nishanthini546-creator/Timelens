const {
  createGoal,
  getActiveGoals,
  deactivateGoal,
} = require("../models/goalModel");
const pool = require("../config/db");

/* ---------- Create Goal ---------- */

const create = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      goalName,
      title,
      category,
    } = req.body;

    const resolvedName = (goalName || title || "").trim();
    const resolvedCategory = (category || "Personal Focus").trim();

    if (!resolvedName) {
      return res.status(400).json({
        success: false,
        message: "Goal name is required.",
      });
    }

    const goal = await createGoal({
      userId,
      goalName: resolvedName,
      category: resolvedCategory,
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully.",
      goal,
    });
  } catch (error) {
    console.error("Create goal error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create goal.",
    });
  }
};

/* ---------- Get Goals ---------- */

const getAll = async (req, res) => {
  try {
    const userId = req.user.userId;

    const goals = await getActiveGoals(userId);

    res.json({
      success: true,
      goals,
    });
  } catch (error) {
    console.error("Get goals error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve goals.",
    });
  }
};

/* ---------- Update Goal Status ---------- */

const updateStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;
    const { status } = req.body;

    const isActive = status !== "completed";
    const result = await pool.query(
      `UPDATE goals
       SET is_active = $1,
           status = $2
       WHERE goal_id = $3 AND user_id = $4
       RETURNING *`,
      [isActive, status || (isActive ? "active" : "completed"), goalId, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      goal: {
        ...row,
        id: row.goal_id,
        title: row.goal_name || row.title,
        goalName: row.goal_name || row.title,
        status: row.status || (row.is_active ? "active" : "completed"),
      },
    });
  } catch (error) {
    console.error("Update goal status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to update goal.",
    });
  }
};

/* ---------- Deactivate Goal ---------- */

const remove = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;

    const goal = await deactivateGoal(userId, goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    res.json({
      success: true,
      message: "Goal deactivated.",
      goal,
    });
  } catch (error) {
    console.error("Deactivate goal error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to deactivate goal.",
    });
  }
};

module.exports = {
  create,
  getAll,
  updateStatus,
  remove,
};