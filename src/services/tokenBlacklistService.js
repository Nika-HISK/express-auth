const cron = require("node-cron");
const { Op } = require("sequelize");
const TokenBlacklist = require("../models/TokenBlacklist");

class TokenBlacklistService {
  async addToBlacklist(token, userId, expiresAt) {
    await TokenBlacklist.create({
      token,
      userId,
      expiresAt,
    });
  }

  async isTokenBlacklisted(token) {
    const blacklistedToken = await TokenBlacklist.findOne({
      where: { token },
    });

    return !!blacklistedToken;
  }

  async cleanupExpiredTokens() {
    const now = new Date();

    const result = await TokenBlacklist.destroy({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });

    return result;
  }

  async getBlacklistedTokensCount() {
    return await TokenBlacklist.count();
  }

  async getExpiredTokensCount() {
    const now = new Date();

    return await TokenBlacklist.count({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });
  }

  async removeTokenFromBlacklist(token) {
    const result = await TokenBlacklist.destroy({
      where: { token },
    });

    return result > 0;
  }

  async getTokensByUserId(userId, limit = 10) {
    return await TokenBlacklist.findAll({
      where: { userId },
      limit,
      order: [["createdAt", "DESC"]],
    });
  }
}

const tokenBlacklistService = new TokenBlacklistService();

const startTokenCleanup = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await tokenBlacklistService.cleanupExpiredTokens();
    } catch (error) {}
  });
};

module.exports = {
  addToBlacklist: (token, userId, expiresAt) =>
    tokenBlacklistService.addToBlacklist(token, userId, expiresAt),
  isTokenBlacklisted: (token) =>
    tokenBlacklistService.isTokenBlacklisted(token),
  cleanupExpiredTokens: () => tokenBlacklistService.cleanupExpiredTokens(),
  getBlacklistedTokensCount: () =>
    tokenBlacklistService.getBlacklistedTokensCount(),
  getExpiredTokensCount: () => tokenBlacklistService.getExpiredTokensCount(),
  removeTokenFromBlacklist: (token) =>
    tokenBlacklistService.removeTokenFromBlacklist(token),
  getTokensByUserId: (userId, limit) =>
    tokenBlacklistService.getTokensByUserId(userId, limit),
  startTokenCleanup,
};
