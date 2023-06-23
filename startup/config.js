const logger = require("../services/logger");
const morgan = require("morgan");

module.exports = function (app) {
  if (!process.env.JWT_PRIVATE_KEY) {
    throw new Error("FATAl ERROR: JWT_PRIVATE_KEY is not defined.");
  }

  if (app.get("env") !== "Production") {
    app.use(morgan("tiny"));
    logger.info("Enabled Morgan HTTP request logging...");
  }
};
