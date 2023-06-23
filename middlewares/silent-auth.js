// plugins
const jwt = require("jsonwebtoken");

function silentAuth(req, res, next) {
  const token = req.header("x-auth-token");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
      req.user = decoded;
    } catch (err) {
      console.log(err.message);
    }
  }

  next();
}

module.exports = silentAuth;
