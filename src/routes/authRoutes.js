const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { register, login, getProfile, updateProfile, logout } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', login);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', verifyToken, getProfile);

/**
 * PUT /api/auth/profile
 * Update current user profile
 */
router.put('/profile', verifyToken, updateProfile);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', verifyToken, logout);

module.exports = router;
