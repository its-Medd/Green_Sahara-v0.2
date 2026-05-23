const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const required = ["JWT_SECRET"];
required.forEach((key) => {
  if (!process.env[key]) {
    // Keep startup resilient in local development, but warn clearly.
    console.warn(`[ENV] Missing ${key} in environment variables`);
  }
});

if (!process.env.DATABASE_URL) {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const db = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASSWORD;

  if (host && port && db && user && typeof pass === "string") {
    process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${db}`;
  } else if (!isProduction) {
    process.env.DATABASE_URL = "mysql://root:@127.0.0.1:3307/green_sahara";
  } else {
    console.warn("[ENV] Missing DATABASE_URL or complete DB_* variables for production startup");
  }
}

module.exports = {
  nodeEnv,
  port: Number(process.env.PORT || process.env.SERVER_PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  adminEmail: process.env.ADMIN_EMAIL || "admin@greensahara.local",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@123456",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiApiUrl:
    process.env.GEMINI_API_URL ||
    "https://generativelanguage.googleapis.com/v1beta",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  enableArduino: process.env.ENABLE_ARDUINO === "true",
  // Arduino serial port config
  arduinoPort: process.env.ARDUINO_PORT || "COM3",
  arduinoBaudRate: Number(process.env.ARDUINO_BAUD_RATE || 9600),
};
