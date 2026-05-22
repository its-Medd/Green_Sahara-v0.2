const logger = require("../utils/logger");

function errorMiddleware(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl}`, err.message);
  if (res.headersSent) return next(err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Une erreur serveur est survenue"
  });
}

module.exports = errorMiddleware;

