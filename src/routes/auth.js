const express = require("express");
const authService = require("../services/authService");
const { validate } = require("../middleware/validation");
const { registerSchema, loginSchema } = require("../validation/schemas");
const { authenticateToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  })
);

router.post(
  "/login/admin",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.loginAdmin(req.body);
    res.json(result);
  })
);

router.post(
  "/logout",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const result = await authService.logout(req.token, req.user.id);
    res.json(result);
  })
);

router.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        banned: req.user.banned,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  })
);

module.exports = router;
