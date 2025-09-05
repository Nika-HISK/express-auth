const express = require("express");
const userService = require("../services/userService");
const { validate } = require("../middleware/validation");
const {
  registerSchema,
  updateUserSchema,
  idParamSchema,
} = require("../validation/schemas");
const {
  authenticateToken,
  requireAdmin,
  requireUserOrAdmin,
} = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await userService.create(req.body);
    res.status(201).json(result);
  })
);

router.get(
  "/",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, banned } = req.query;
    const result = await userService.getAllUsers(page, limit, role, banned);
    res.json(result);
  })
);

router.get(
  "/:id",
  authenticateToken,
  requireUserOrAdmin,
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== "Admin" && req.user.id !== parseInt(id)) {
      return res
        .status(403)
        .json({ message: "Access denied. You can only access your own data." });
    }

    const user = await userService.findById(id);
    res.json({ user });
  })
);

router.patch(
  "/:id",
  authenticateToken,
  validate(idParamSchema, "params"),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (req.user.role !== "Admin" && req.user.id !== parseInt(id)) {
      return res
        .status(403)
        .json({ message: "Access denied. You can only update your own data." });
    }

    if (req.user.role !== "Admin") {
      delete updateData.role;
      delete updateData.banned;
    }

    const result = await userService.update(id, updateData);
    res.json(result);
  })
);

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account." });
    }

    const result = await userService.delete(id);
    res.json(result);
  })
);

router.patch(
  "/:id/ban",
  authenticateToken,
  requireAdmin,
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: "You cannot ban yourself." });
    }

    const result = await userService.banUser(id);
    res.json(result);
  })
);

router.patch(
  "/:id/unban",
  authenticateToken,
  requireAdmin,
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await userService.unbanUser(id);
    res.json(result);
  })
);

module.exports = router;
