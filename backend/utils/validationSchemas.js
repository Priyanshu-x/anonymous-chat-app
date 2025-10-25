// backend/utils/validationSchemas.js
const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  avatar: Joi.string().uri().allow(null, '')
});

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

const updateProfileSchema = Joi.object({
  avatar: Joi.string().uri().allow(null, '')
});

const messageSchema = Joi.object({
  user: Joi.string().hex().length(24).required(), // Assuming MongoDB ObjectId
  content: Joi.string().max(1000).allow(null, ''),
  type: Joi.string().valid('text', 'image', 'voice', 'file').default('text'),
  imageUrl: Joi.string().uri().allow(null, ''),
  voiceUrl: Joi.string().uri().allow(null, ''),
  fileUrl: Joi.string().uri().allow(null, ''),
  fileName: Joi.string().allow(null, '')
}).xor('content', 'imageUrl', 'voiceUrl', 'fileUrl'); // At least one of these must be present

const blockIpSchema = Joi.object({
  ip: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required(),
  reason: Joi.string().max(255).allow(null, '')
});

const banUserSchema = Joi.object({
  duration: Joi.number().integer().min(1).max(720).default(24) // 1 hour to 30 days
});

const announcementSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
  type: Joi.string().valid('info', 'warning', 'danger').default('info')
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  messageSchema,
  blockIpSchema,
  banUserSchema,
  announcementSchema
};