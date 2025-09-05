const validate = (schema, property = "body") => {
  return (req, res, next) => {
    let data;

    switch (property) {
      case "body":
        data = req.body;
        break;
      case "params":
        data = req.params;
        break;
      case "query":
        data = req.query;
        break;
      default:
        data = req.body;
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors: errorMessages,
      });
    }

    if (property === "body") {
      req.body = value;
    } else if (property === "params") {
      req.params = value;
    } else if (property === "query") {
      req.query = value;
    }

    next();
  };
};

module.exports = { validate };
