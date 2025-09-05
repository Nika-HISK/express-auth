const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { addToBlacklist } = require("./tokenBlacklistService");
const { createError } = require("../middleware/errorHandler");

class AuthService {
  async register(userData) {
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
      message: "User successfully registered",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginData) {
    const { email, password } = loginData;

    const user = await User.scope("withPassword").findOne({
      where: { email },
    });

    if (!user) {
      throw createError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw createError(401, "Invalid credentials");
    }

    if (user.banned) {
      throw createError(401, "Access denied. You are banned.");
    }

    const token = this.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
    };
  }

  async loginAdmin(loginData) {
    const { email, password } = loginData;

    const user = await User.scope("withPassword").findOne({
      where: { email },
    });

    if (!user) {
      throw createError(400, "The email or password you entered is incorrect");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw createError(400, "The email or password you entered is incorrect");
    }

    if (user.banned) {
      throw createError(401, "Access denied. You are banned.");
    }

    if (user.role !== "Admin") {
      throw createError(401, "Access denied. Admins only.");
    }

    const token = this.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
    };
  }

  async logout(token, userId) {
    try {
      const decoded = jwt.decode(token);

      if (!decoded || !decoded.exp) {
        throw createError(400, "Invalid token");
      }

      const expiresAt = new Date(decoded.exp * 1000);

      await addToBlacklist(token, userId, expiresAt);

      return { message: "Successfully logged out" };
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw createError(500, "Logout failed");
    }
  }

  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXP || "1h",
    });
  }
}

module.exports = new AuthService();
