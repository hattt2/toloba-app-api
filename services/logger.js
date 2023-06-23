const winston = require("winston");
const moment = require("moment");
require("winston-mongodb");

const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: () => moment().format("YYYY-MM-DD HH:mm:ss"),
  }),
  winston.format.printf((info) => {
    return `${info.timestamp} - ${info.level.toUpperCase()}: ${info.message}`;
  })
);

const infoTransport = new winston.transports.Console({ format: consoleFormat });

const logger = winston.createLogger({
  transports: [infoTransport],
});

module.exports = logger;
