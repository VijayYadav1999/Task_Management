const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
} = require('../utils/validators');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const register = async (req, res, next) => {
  try {
    const { error, value } = validateUserRegistration(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: error.details.map((e) => e.message),
      });
    }

    const { firstName, lastName, email, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const login = async (req, res, next) => {
  try {
    const { error, value } = validateUserLogin(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: error.details.map((e) => e.message),
      });
    }

    const { email, password } = value;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .populate('teams', 'name')
      .populate('assignedTasks', 'title status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = validateProfileUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: error.details.map((e) => e.message),
      });
    }

    const user = await User.findByIdAndUpdate(req.userId, value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
};
