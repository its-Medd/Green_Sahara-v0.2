const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const required = ["JWT_SECRET"];
required.forEach((key) => {
  if (!process.env[key]) {
    // Keep startup resilient in local development, but warn clearly.
    console.warn(`[ENV] Missing ${key} in environment variables`);
  }
});

if (!process.env.DATABASE_URL) {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = process.env.DB_PORT || "3307";
  const db = process.env.DB_NAME || "green_sahara";
  const user = process.env.DB_USER || "root";
  const pass = process.env.DB_PASSWORD || "";
  process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${db}`;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.SERVER_PORT || 5000),
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
  // Arduino serial port config
  arduinoPort: process.env.ARDUINO_PORT || "COM3",
  arduinoBaudRate: Number(process.env.ARDUINO_BAUD_RATE || 9600),
};
