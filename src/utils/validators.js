const Joi = require('joi');

/**
 * Validate user registration data
 * @param {object} data - User data to validate
 * @returns {object} Joi validation result
 */
const validateUserRegistration = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().min(2),
    lastName: Joi.string().required().min(2),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
      'any.only': 'Passwords do not match',
    }),
  });
  return schema.validate(data);
};

/**
 * Validate user login data
 * @param {object} data - Login data to validate
 * @returns {object} Joi validation result
 */
const validateUserLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

/**
 * Validate profile update data
 * @param {object} data - Profile data to validate
 * @returns {object} Joi validation result
 */
const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
    bio: Joi.string().max(500),
    phone: Joi.string(),
    department: Joi.string(),
  });
  return schema.validate(data);
};

/**
 * Validate task creation data
 * @param {object} data - Task data to validate
 * @returns {object} Joi validation result
 */
const validateTaskCreation = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3),
    description: Joi.string().required(),
    dueDate: Joi.date().required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    team: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
  });
  return schema.validate(data);
};

/**
 * Validate task update data
 * @param {object} data - Task data to validate
 * @returns {object} Joi validation result
 */
const validateTaskUpdate = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3),
    description: Joi.string(),
    dueDate: Joi.date(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    status: Joi.string().valid('open', 'in-progress', 'completed', 'on-hold'),
    tags: Joi.array().items(Joi.string()),
  });
  return schema.validate(data);
};

/**
 * Validate team creation data
 * @param {object} data - Team data to validate
 * @returns {object} Joi validation result
 */
const validateTeamCreation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3),
    description: Joi.string().max(500),
  });
  return schema.validate(data);
};

/**
 * Validate comment creation data
 * @param {object} data - Comment data to validate
 * @returns {object} Joi validation result
 */
const validateCommentCreation = (data) => {
  const schema = Joi.object({
    text: Joi.string().required().min(1),
  });
  return schema.validate(data);
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validateTaskCreation,
  validateTaskUpdate,
  validateTeamCreation,
  validateCommentCreation,
};
