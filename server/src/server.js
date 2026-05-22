const env = require("./config/env");
const prisma = require("./config/db");
const app = require("./app");
const logger = require("./utils/logger");
const arduinoService = require("./services/arduinoService");

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info("MariaDB connected via Prisma");

    app.listen(env.port, "0.0.0.0", () => {
      logger.info(`Server running at http://0.0.0.0:${env.port}`);

      // Start Arduino serial reader after server is up
      // If Arduino is not plugged in, this will log a warning and continue gracefully
      arduinoService.start();
    });
  } catch (error) {
    logger.error("Unable to start server", error.message);
    process.exit(1);
  }
}

bootstrap();

