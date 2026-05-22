/**
 * arduinoRoutes.js
 * ----------------
 * REST API routes for accessing Arduino sensor data.
 *
 * Routes (no authentication required — read-only sensor data):
 *   GET /api/arduino/latest   → Latest reading from memory (instant)
 *   GET /api/arduino/readings → Last 50 readings from MariaDB
 *   GET /api/arduino/status   → Arduino connection status
 */

const express = require("express");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const arduinoService = require("../services/arduinoService");

const router = express.Router();

// ─── GET /api/arduino/latest ─────────────────────────────────────────────────
/**
 * Returns the most recent sensor reading held in memory.
 * This is very fast (no DB query) and updates every second when Arduino is connected.
 */
router.get(
  "/latest",
  asyncHandler(async (req, res) => {
    const reading = arduinoService.getLatest();

    if (!reading) {
      return res.json({
        success: true,
        data: null,
        message: "Aucune donnée Arduino reçue pour le moment.",
      });
    }

    res.json({ success: true, data: reading });
  })
);

// ─── GET /api/arduino/readings ────────────────────────────────────────────────
/**
 * Returns the last N readings from the database (default: 50).
 * Supports ?limit=N query parameter.
 */
router.get(
  "/readings",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const readings = await prisma.binReading.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        temperature: true,
        humidity: true,
        distanceCm: true,
        fillPercent: true,
        waterPercent: true,
        status: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: readings, count: readings.length });
  })
);

// ─── GET /api/arduino/status ──────────────────────────────────────────────────
/**
 * Returns whether the Arduino serial port is currently open and
 * the timestamp of the last received reading.
 */
router.get(
  "/status",
  asyncHandler(async (req, res) => {
    const status = arduinoService.getStatus();
    res.json({ success: true, data: status });
  })
);

module.exports = router;
