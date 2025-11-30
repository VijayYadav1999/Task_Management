const Task = require('../models/Task');
const User = require('../models/User');
const Team = require('../models/Team');
const { validateTaskCreation, validateTaskUpdate } = require('../utils/validators');

/**
 * Create a new task
 * @route POST /api/tasks
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const createTask = async (req, res, next) => {
  try {
    const { error, value } = validateTaskCreation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: error.details.map((e) => e.message),
      });
    }

    const { title, description, dueDate, priority, team, tags } = value;

    // Verify team exists and user is a member
    const teamDoc = await Team.findById(team);
    if (!teamDoc) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    const isMember = teamDoc.members.some((m) => m.user.toString() === req.userId);
    if (!isMember && teamDoc.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      team,
      tags: tags || [],
      createdBy: req.userId,
    });

    await newTask.save();
    await newTask.populate('createdBy', 'firstName lastName email');

    // Add task to team
    teamDoc.tasks.push(newTask._id);
    await teamDoc.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks
 * @route GET /api/tasks
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, team, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (team) filter.team = team;

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tasks assigned to current user
 * @route GET /api/tasks/my-tasks
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getMyTasks = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { assignedTo: req.userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('team', 'name')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single task
 * @route GET /api/tasks/:id
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('team', 'name')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName email',
        },
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task
 * @route PUT /api/tasks/:id
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const updateTask = async (req, res, next) => {
  try {
    const { error, value } = validateTaskUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: error.details.map((e) => e.message),
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user is creator or assigned to task
    if (task.createdBy.toString() !== req.userId && !task.assignedTo.includes(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task',
      });
    }

    // If marking as completed, set completedAt
    if (value.status === 'completed' && task.status !== 'completed') {
      value.completedAt = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign task to users
 * @route PUT /api/tasks/:id/assign
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const assignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo || !Array.isArray(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: 'assignedTo must be an array of user IDs',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user is creator
    if (task.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can assign tasks',
      });
    }

    // Verify all users exist and are team members
    const team = await Team.findById(task.team).populate('members.user');
    const teamMemberIds = team.members.map((m) => m.user._id.toString());

    for (let userId of assignedTo) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User ${userId} not found`,
        });
      }

      if (!teamMemberIds.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: `User ${user.email} is not a member of this team`,
        });
      }
    }

    task.assignedTo = assignedTo;
    await task.save();

    // Update assigned tasks for users
    await User.updateMany({ _id: { $in: assignedTo } }, { $addToSet: { assignedTasks: task._id } });

    const updatedTask = await task.populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search tasks
 * @route GET /api/tasks/search/:query
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const searchTasks = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { team } = req.query;

    let filter = {
      $text: { $search: query },
    };

    if (team) {
      filter.team = team;
    }

    const tasks = await Task.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete task
 * @route DELETE /api/tasks/:id
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user is creator
    if (task.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can delete tasks',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Remove task from team
    await Team.findByIdAndUpdate(task.team, { $pull: { tasks: task._id } });

    // Remove task from assigned users
    await User.updateMany({ _id: { $in: task.assignedTo } }, { $pull: { assignedTasks: task._id } });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  assignTask,
  searchTasks,
  deleteTask,
};
