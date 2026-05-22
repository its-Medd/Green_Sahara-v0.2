const ApiError = require("../utils/apiError");

const roleMiddleware =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Accès refusé pour ce rôle"));
    }
    return next();
  };

module.exports = roleMiddleware;

