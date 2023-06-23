const mongoose = require("mongoose");

// resources
const errorResponse = require("../resources/error-response");

module.exports = (paramName = "id") => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return res.status(404).send(errorResponse(["Not found."]));
    }

    next();
  };
};
