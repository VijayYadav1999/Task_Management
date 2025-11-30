const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createTeam,
  getAllTeams,
  getMyTeams,
  getTeamById,
  addMember,
  removeMember,
  updateTeam,
  deleteTeam,
} = require('../controllers/teamController');

const router = express.Router();

/**
 * POST /api/teams
 * Create a new team
 */
router.post('/', verifyToken, createTeam);

/**
 * GET /api/teams
 * Get all teams
 */
router.get('/', verifyToken, getAllTeams);

/**
 * GET /api/teams/my-teams
 * Get teams for current user
 */
router.get('/my-teams', verifyToken, getMyTeams);

/**
 * GET /api/teams/:id
 * Get a specific team
 */
router.get('/:id', verifyToken, getTeamById);

/**
 * PUT /api/teams/:id
 * Update a team
 */
router.put('/:id', verifyToken, updateTeam);

/**
 * POST /api/teams/:id/members
 * Add a member to team
 */
router.post('/:id/members', verifyToken, addMember);

/**
 * DELETE /api/teams/:id/members/:userId
 * Remove a member from team
 */
router.delete('/:id/members/:userId', verifyToken, removeMember);

/**
 * DELETE /api/teams/:id
 * Delete a team
 */
router.delete('/:id', verifyToken, deleteTeam);

module.exports = router;
