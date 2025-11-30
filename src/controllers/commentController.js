const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { validateCommentCreation } = require('../utils/validators');

/**
 * Create comment on a task
 * @route POST /api/tasks/:taskId/comments
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const createComment = async (req, res, next) => {
  try {
    const { error, value } = validateCommentCreation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: error.details.map((e) => e.message),
      });
    }

    const { text } = value;
    const { taskId } = req.params;

    // Verify task exists
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const newComment = new Comment({
      text,
      task: taskId,
      author: req.userId,
    });

    await newComment.save();
    await newComment.populate('author', 'firstName lastName email');

    // Add comment to task
    task.comments.push(newComment._id);
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments for a task
 * @route GET /api/tasks/:taskId/comments
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'firstName lastName email')
      .populate('mentions', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ task: taskId });

    res.status(200).json({
      success: true,
      data: comments,
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
 * Update comment
 * @route PUT /api/comments/:id
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const updateComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user is author
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only author can update comment',
      });
    }

    comment.text = text;
    await comment.save();

    await comment.populate('author', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comment
 * @route DELETE /api/comments/:id
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user is author
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only author can delete comment',
      });
    }

    const taskId = comment.task;

    await Comment.findByIdAndDelete(req.params.id);

    // Remove comment from task
    await Task.findByIdAndUpdate(taskId, { $pull: { comments: req.params.id } });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
