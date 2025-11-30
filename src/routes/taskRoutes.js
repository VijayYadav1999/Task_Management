const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  assignTask,
  searchTasks,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', verifyToken, createTask);

/**
 * GET /api/tasks
 * Get all tasks with filters
 */
router.get('/', verifyToken, getAllTasks);

/**
 * GET /api/tasks/my-tasks
 * Get tasks assigned to current user
 */
router.get('/my-tasks', verifyToken, getMyTasks);

/**
 * GET /api/tasks/search/:query
 * Search tasks by title, description, or tags
 */
router.get('/search/:query', verifyToken, searchTasks);

/**
 * GET /api/tasks/:id
 * Get a specific task
 */
router.get('/:id', verifyToken, getTaskById);

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put('/:id', verifyToken, updateTask);

/**
 * PUT /api/tasks/:id/assign
 * Assign task to users
 */
router.put('/:id/assign', verifyToken, assignTask);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;
