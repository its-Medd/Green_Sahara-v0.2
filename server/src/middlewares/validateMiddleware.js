const { validationResult } = require("express-validator");

function validateMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation invalide",
      errors: errors.array()
    });
  }

  return next();
}

module.exports = validateMiddleware;

