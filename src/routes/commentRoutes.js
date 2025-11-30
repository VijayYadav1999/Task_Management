const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

/**
 * POST /api/tasks/:taskId/comments
 * Create a comment on a task
 */
router.post('/', verifyToken, createComment);

/**
 * GET /api/tasks/:taskId/comments
 * Get all comments for a task
 */
router.get('/', verifyToken, getComments);

/**
 * PUT /api/comments/:id
 * Update a comment
 */
router.put('/:id', verifyToken, updateComment);

/**
 * DELETE /api/comments/:id
 * Delete a comment
 */
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;
