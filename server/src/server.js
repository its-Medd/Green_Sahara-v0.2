const env = require("./config/env");
const prisma = require("./config/db");
const app = require("./app");
const logger = require("./utils/logger");
const arduinoService = env.enableArduino ? require("./services/arduinoService") : null;

async function bootstrap() {
  let databaseReady = false;

  try {
    await prisma.$connect();
    databaseReady = true;
    logger.info("MariaDB connected via Prisma");
  } catch (error) {
    logger.warn(`Database unavailable at startup: ${error.message}`);
    logger.warn("Server will continue in limited mode until the database connection is fixed.");
  }

  app.listen(env.port, "0.0.0.0", () => {
    logger.info(`Server running at http://0.0.0.0:${env.port}`);

    if (!databaseReady) {
      logger.warn("API routes that need Prisma will fail until the database starts working.");
    }

    if (env.enableArduino && arduinoService) {
      arduinoService.start();
    } else {
      logger.info("Arduino integration disabled. Set ENABLE_ARDUINO=true to enable it.");
    }
  });
}

bootstrap();
