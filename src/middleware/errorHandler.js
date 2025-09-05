const errorHandler = (error, req, res, next) => {
  if (error.name === "SequelizeValidationError") {
    const errors = error.errors.map((err) => ({
      field: err.path,
      message: err.message,
    }));
    return res.status(400).json({
      message: "Validation error",
      errors,
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    const field = error.errors[0]?.path || "field";
    return res.status(400).json({
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`,
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      message: "Invalid reference to related resource",
    });
  }

  if (error.name === "SequelizeConnectionError") {
    return res.status(503).json({
      message: "Database connection error",
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  if (error.status) {
    return res.status(error.status).json({
      message: error.message || "An error occurred",
    });
  }

  res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = {
  errorHandler,
  asyncHandler,
  createError,
};
