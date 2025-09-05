const User = require("../models/Users");
const { createError } = require("../middleware/errorHandler");

class UserService {
  async findById(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw createError(404, `User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async create(userData) {
    const { username, email, password, confirmPassword } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw createError(400, "Email already in use");
    }

    if (password !== confirmPassword) {
      throw createError(400, "Passwords do not match");
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    return {
      message: "User successfully created",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async update(id, updateData) {
    const user = await User.findByPk(id);

    if (!user) {
      throw createError(404, `User with ID ${id} not found`);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: updateData.email },
      });
      if (existingUser) {
        throw createError(400, "Email already in use");
      }
    }

    await user.update(updateData);

    return {
      message: "User successfully updated",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        banned: user.banned,
      },
    };
  }

  async delete(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw createError(404, `User with ID ${id} not found`);
    }

    await user.destroy();

    return {
      message: `User with ID ${id} successfully deleted`,
    };
  }

  async getAllUsers(page = 1, limit = 10, role = null, banned = null) {
    const offset = (page - 1) * limit;
    const where = {};

    if (role) {
      where.role = role;
    }

    if (banned !== null) {
      where.banned = banned;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return {
      users: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: page * limit < count,
        hasPrev: page > 1,
      },
    };
  }

  async banUser(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw createError(404, `User with ID ${id} not found`);
    }

    await user.update({ banned: true });

    return {
      message: `User with ID ${id} has been banned`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        banned: user.banned,
      },
    };
  }

  async unbanUser(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw createError(404, `User with ID ${id} not found`);
    }

    await user.update({ banned: false });

    return {
      message: `User with ID ${id} has been unbanned`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        banned: user.banned,
      },
    };
  }
}

module.exports = new UserService();
