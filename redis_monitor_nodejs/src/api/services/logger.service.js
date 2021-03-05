const path = require("path");
const winston = require("winston");

// Imports the Google Cloud client library for Winston
const { LoggingWinston } = require("@google-cloud/logging-winston");

const loggingWinston = new LoggingWinston();

const logPath = process.env.LOG_PATH || "./";
const loggerEngine = process.env.LOGGER_ENGINE || "local";

let logger;

if (loggerEngine == "app_engine") {
  // for google stack driver
  const prodTransport = [
    new winston.transports.Console(),
    // Add Stackdriver Logging
    loggingWinston
  ];

  logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.simple()
    ),
    transports: prodTransport
  });
} else {
  // define the custom settings for each transport (file, console)
  const options = {
    file: {
      level: process.env.LOG_LEVEL || "info",
      filename: path.join(logPath, "logs", "app.log"),
      handleExceptions: true,
      json: true,
      maxSize: process.env.LOG_SIZE || 5242880, // 5MB
      maxFiles: process.env.LOG_ROTATION_DAYS || 5,
      colorize: false
    }
  };

  const devTransport = [new winston.transports.File(options.file)];

  logger = winston.createLogger({
    level: "info",
    transports: devTransport
  });

  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.splat(),
          winston.format.simple()
        )
      })
    );
  }
}

module.exports = logger;
