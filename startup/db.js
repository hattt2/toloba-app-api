const mongoose = require("mongoose");
const logger = require("../services/logger");

module.exports = function () {
  const db = process.env.DATABASE_URL;

  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => logger.info(`Connected to ${db}...`));
};
