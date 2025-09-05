const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true,
  },
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();

    require("../models/Users");
    require("../models/TokenBlacklist");

    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });

    return sequelize;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDatabase,
};
