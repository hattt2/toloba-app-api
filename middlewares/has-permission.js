// helpers
const { hasPermissionForResource } = require("../helpers/roles-helper");

// resources
const errorResponse = require("../resources/error-response");

module.exports = (resource, permission) => {
  return (req, res, next) => {
    if (!hasPermissionForResource(req.user, resource, permission))
      return res.status(403).send(errorResponse(["Access Denied."]));
    next();
  };
};
