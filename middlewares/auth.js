// plugins
const jwt = require("jsonwebtoken");

// resources
const errorResponse = require("../resources/error-response");

// models
const { findUserById } = require("../models/user");

async function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send(errorResponse(["Unauthorised"]));

  try {
    const user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = await findUserById(user._id);
    next();
  } catch (err) {
    console.log(err.message);
    return res.status(401).send(errorResponse(["Invalid token."]));
  }
}

module.exports = auth;
