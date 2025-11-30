const Team = require('../models/Team');
const User = require('../models/User');
const { validateTeamCreation } = require('../utils/validators');

/**
 * Create a new team
 * @route POST /api/teams
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const createTeam = async (req, res, next) => {
  try {
    const { error, value } = validateTeamCreation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: error.details.map((e) => e.message),
      });
    }

    const { name, description } = value;

    const newTeam = new Team({
      name,
      description,
      owner: req.userId,
      members: [
        {
          user: req.userId,
          role: 'owner',
        },
      ],
    });

    await newTeam.save();
    await newTeam.populate('owner', 'firstName lastName email');
    await newTeam.populate('members.user', 'firstName lastName email');

    // Add team to user
    await User.findByIdAndUpdate(req.userId, { $push: { teams: newTeam._id } });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: newTeam,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all teams
 * @route GET /api/teams
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get teams for current user
 * @route GET /api/teams/my-teams
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.userId }, { 'members.user': req.userId }],
    })
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .populate('tasks', 'title status');

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get team by ID
 * @route GET /api/teams/:id
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignedTo createdBy',
          select: 'firstName lastName email',
        },
      });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add member to team
 * @route POST /api/teams/:id/members
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is owner or admin
    const userMember = team.members.find((m) => m.user.toString() === req.userId);
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or admin can add members',
      });
    }

    // Find user to add
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    // Check if already a member
    const alreadyMember = team.members.some((m) => m.user.toString() === userToAdd._id.toString());

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team',
      });
    }

    // Add member
    team.members.push({
      user: userToAdd._id,
      role: 'member',
    });

    await team.save();

    // Add team to user
    await User.findByIdAndUpdate(userToAdd._id, { $push: { teams: team._id } });

    await team.populate('members.user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Member added to team successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove member from team
 * @route DELETE /api/teams/:id/members/:userId
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is owner
    if (team.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only owner can remove members',
      });
    }

    // Remove member
    team.members = team.members.filter((m) => m.user.toString() !== userId);
    await team.save();

    // Remove team from user
    await User.findByIdAndUpdate(userId, { $pull: { teams: team._id } });

    await team.populate('members.user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Member removed from team successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update team
 * @route PUT /api/teams/:id
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is owner
    if (team.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only owner can update team',
      });
    }

    const { name, description } = req.body;

    if (name) team.name = name;
    if (description) team.description = description;

    await team.save();

    await team.populate('owner', 'firstName lastName email');
    await team.populate('members.user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete team
 * @route DELETE /api/teams/:id
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is owner
    if (team.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only owner can delete team',
      });
    }

    // Remove team from all members
    await User.updateMany({ _id: { $in: team.members.map((m) => m.user) } }, { $pull: { teams: team._id } });

    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  getMyTeams,
  getTeamById,
  addMember,
  removeMember,
  updateTeam,
  deleteTeam,
};
