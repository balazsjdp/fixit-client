import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  browser: {
    asObject: true,
  },
});

if (process.env.NODE_ENV !== "production") {
  logger.info("Logger initialized in debug mode");
}

export default logger;
