const {
  createGoal,
  getActiveGoals,
  deactivateGoal,
} = require("../models/goalModel");


/* ---------- Create Goal ---------- */

const create = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      goalName,
      category,
    } = req.body;

    if (!goalName || !category) {
      return res.status(400).json({
        success: false,
        message: "Goal name and category are required.",
      });
    }

    const goal = await createGoal({
      userId,
      goalName: goalName.trim(),
      category,
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully.",
      goal,
    });

  } catch (error) {
    console.error("Create goal error:", error);

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
    console.error("Get goals error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve goals.",
    });
  }
};


/* ---------- Deactivate Goal ---------- */

const remove = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;

    const goal = await deactivateGoal(
      userId,
      goalId
    );

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
    console.error(
      "Deactivate goal error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to deactivate goal.",
    });
  }
};


module.exports = {
  create,
  getAll,
  remove,
};