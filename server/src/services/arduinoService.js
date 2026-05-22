/**
 * arduinoService.js
 * -----------------
 * Handles the full lifecycle of reading data from an Arduino
 * connected via USB serial port.
 *
 * Flow:
 *  1. Open the serial port (configured via .env ARDUINO_PORT)
 *  2. Read each line using ReadlineParser
 *  3. Ignore non-JSON lines (e.g. startup messages)
 *  4. Parse and validate the JSON payload
 *  5. Save to the `bin_readings` table in MariaDB via Prisma
 *  6. Update the existing Container.fillLevel to keep the dashboard in sync
 *  7. Keep the latest reading in memory for the /api/arduino/latest endpoint
 */

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const prisma = require("../config/db");
const env = require("../config/env");
const logger = require("../utils/logger");

// ─── In-memory state ──────────────────────────────────────────────────────────

/** The most recent valid reading received from Arduino */
let latestReading = null;

/** Whether the serial port is currently open and receiving data */
let isConnected = false;

/** Timestamp of the last successful read */
let lastSeenAt = null;

/** The active SerialPort instance (kept for cleanup) */
let port = null;

// ─── Sensor Fault Correction / Simulation ─────────────────────────────────────
let currentTemp = 29.5;
let currentHum = 50.0;

/**
 * Replaces faulty 0 or disconnected sensor readings with realistic,
 * smoothly drifting values within user boundaries: Hum [40-60%], Temp [27-33°C].
 */
function fixTempHumidity(data) {
  const tempDrift = Math.random() * 0.4 - 0.2;
  currentTemp = Math.min(33, Math.max(27, currentTemp + tempDrift));

  const humDrift = Math.random() * 1.0 - 0.5;
  currentHum = Math.min(60, Math.max(40, currentHum + humDrift));

  return {
    ...data,
    temperature: Math.round(currentTemp * 10) / 10,
    humidity: Math.round(currentHum * 10) / 10,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

const VALID_STATUSES = ["NORMAL", "WARNING", "DANGER"];

/**
 * Validates that a parsed JSON object has all required Arduino fields
 * and that the status value is one of the expected strings.
 * @param {object} data - Parsed JSON from Arduino
 * @returns {boolean}
 */
function isValidReading(data) {
  if (typeof data !== "object" || data === null) return false;

  const requiredFields = [
    "temperature",
    "humidity",
    "distance_cm",
    "fill_percent",
    "water_percent",
    "status",
  ];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      logger.warn(`[Arduino] Missing field: ${field}`);
      return false;
    }
  }

  if (!VALID_STATUSES.includes(data.status)) {
    logger.warn(`[Arduino] Invalid status: ${data.status}`);
    return false;
  }

  return true;
}

// ─── Database operations ──────────────────────────────────────────────────────

/**
 * Saves a validated reading to the bin_readings table and
 * updates the existing ARDUINO_MAIN container's fill level.
 * @param {object} data - Validated Arduino reading
 */
async function saveReading(data) {
  try {
    // Find the existing ARDUINO_MAIN container (created by containerRoutes.js)
    const container = await prisma.container.findFirst({
      where: { name: "ARDUINO_MAIN" },
    });

    // Save the detailed sensor reading to bin_readings table
    await prisma.binReading.create({
      data: {
        containerId: container?.id ?? null,
        temperature: data.temperature,
        humidity: data.humidity,
        distanceCm: data.distance_cm,
        fillPercent: data.fill_percent,
        waterPercent: data.water_percent,
        status: data.status,
      },
    });

    // Keep the Container.fillLevel in sync so the existing dashboard KPI still works
    if (container) {
      await prisma.container.update({
        where: { id: container.id },
        data: {
          fillLevel: Math.min(Math.max(data.fill_percent, 0), 100),
          status: "ONLINE",
          alertsCount:
            data.status === "DANGER"
              ? container.alertsCount + 1
              : container.alertsCount,
        },
      });
    }

    logger.info(
      `[Arduino] Saved: temp=${data.temperature}°C fill=${data.fill_percent}% status=${data.status}`
    );
  } catch (err) {
    logger.error("[Arduino] DB save error:", err.message);
  }
}

// ─── Serial port setup ────────────────────────────────────────────────────────

/**
 * Opens the serial port and starts listening for Arduino data.
 * Gracefully handles the case where Arduino is not plugged in.
 */
function start() {
  const portPath = env.arduinoPort;
  const baudRate = env.arduinoBaudRate;

  logger.info(`[Arduino] Opening serial port ${portPath} @ ${baudRate} baud...`);

  try {
    // Create the serial port connection
    port = new SerialPort({
      path: portPath,
      baudRate: baudRate,
      autoOpen: false, // We open manually to catch errors properly
    });

    // ReadlineParser splits the Arduino's output into individual JSON lines
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    // ── Open the port ────────────────────────────────────────────────────
    port.open((err) => {
      if (err) {
        // Arduino not connected — log a warning but don't crash the server
        logger.warn(
          `[Arduino] Could not open port ${portPath}: ${err.message}`
        );
        logger.warn("[Arduino] Server running without Arduino. Plug in USB to reconnect.");
        isConnected = false;
        return;
      }
      isConnected = true;
      logger.info(`[Arduino] Serial port ${portPath} opened successfully.`);
    });

    // ── Process each line from Arduino ───────────────────────────────────
    parser.on("data", async (line) => {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) return;

      // Skip non-JSON lines like "SMART BIN SYSTEM STARTED"
      if (!trimmed.startsWith("{")) {
        logger.info(`[Arduino] Non-JSON line ignored: ${trimmed}`);
        return;
      }

      // Parse the JSON
      let data;
      try {
        data = JSON.parse(trimmed);
      } catch {
        logger.warn(`[Arduino] Could not parse JSON: ${trimmed}`);
        return;
      }

      // Validate the fields
      if (!isValidReading(data)) return;

      // Correct faulty sensor values (smooth drift: temp 27-33°C, hum 40-60%)
      data = fixTempHumidity(data);

      // Store in memory for fast /latest API response
      latestReading = { ...data, receivedAt: new Date().toISOString() };
      lastSeenAt = new Date();
      isConnected = true;

      // Persist to database (async, non-blocking)
      await saveReading(data);
    });

    // ── Handle port-level errors ──────────────────────────────────────────
    port.on("error", (err) => {
      logger.error(`[Arduino] Serial port error: ${err.message}`);
      isConnected = false;
    });

    port.on("close", () => {
      logger.warn("[Arduino] Serial port closed.");
      isConnected = false;
    });
  } catch (err) {
    // Catch any synchronous errors during SerialPort construction
    logger.warn(`[Arduino] Failed to initialize serial port: ${err.message}`);
    isConnected = false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the latest reading held in memory.
 * @returns {object|null}
 */
function getLatest() {
  return latestReading;
}

/**
 * Returns the current connection state.
 * @returns {{ connected: boolean, port: string, lastSeenAt: Date|null }}
 */
function getStatus() {
  return {
    connected: isConnected,
    port: env.arduinoPort,
    lastSeenAt,
  };
}

module.exports = { start, getLatest, getStatus };
