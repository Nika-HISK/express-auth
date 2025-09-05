const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().min(2).max(50).required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "string.min": "Username must be at least 2 characters long",
    "string.max": "Username must not exceed 50 characters",
    "any.required": "Username is required",
  }),

  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .pattern(/(?=.*[A-Z])/)
    .pattern(/(?=.*\d)/)
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter and one number",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(2).max(50).optional().messages({
    "string.base": "Username must be a string",
    "string.min": "Username must be at least 2 characters long",
    "string.max": "Username must not exceed 50 characters",
  }),

  email: Joi.string().email().optional().messages({
    "string.base": "Email must be a string",
    "string.email": "Please provide a valid email address",
  }),

  role: Joi.string().valid("User", "Admin").optional().messages({
    "any.only": "Role must be either User or Admin",
  }),

  banned: Joi.boolean().optional().messages({
    "boolean.base": "Banned must be a boolean value",
  }),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive number",
    "any.required": "ID is required",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  idParamSchema,
};
