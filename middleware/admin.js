const config = require("config");

function admin(req, res, next) {
  // Check configuration
  if (!config.get("requiresAuth")) return next();

  // Check if user is admin
  if (!req.user.isAdmin) return res.status(403).send("Access denied");

  next();
}

module.exports = admin;
