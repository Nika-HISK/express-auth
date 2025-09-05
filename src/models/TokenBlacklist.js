const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TokenBlacklist = sequelize.define(
  "TokenBlacklist",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        isInt: true,
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true,
      },
    },
  },
  {
    tableName: "token_blacklists",
    indexes: [
      {
        unique: true,
        fields: ["token"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["expires_at"],
      },
    ],
  }
);

module.exports = TokenBlacklist;
