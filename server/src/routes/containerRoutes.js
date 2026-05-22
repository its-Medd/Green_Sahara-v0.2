const express = require("express");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * POST /api/container/update
 * Arduino sends fill level data (no auth — IoT device).
 * Expected body: { fillLevel: number, temperature?: number }
 */
router.post(
  "/update",
  asyncHandler(async (req, res) => {
    const fillLevel = Number(req.body.fillLevel ?? 0);
    const temperature = req.body.temperature ? Number(req.body.temperature) : null;

    // Find or create the single container
    let container = await prisma.container.findFirst({
      where: { name: "ARDUINO_MAIN" }
    });

    if (!container) {
      // Auto-create the main container on first Arduino ping
      container = await prisma.container.create({
        data: {
          name: "ARDUINO_MAIN",
          location: "Point de collecte principal",
          capacityLiters: 1000,
          fillLevel: 0,
          alertsCount: 0,
          status: "ONLINE"
        }
      });
      logger.info("Arduino main container created automatically");
    }

    // Update fill level
    const updated = await prisma.container.update({
      where: { id: container.id },
      data: {
        fillLevel: Math.min(Math.max(fillLevel, 0), 100),
        status: "ONLINE",
        alertsCount: fillLevel >= 85 ? container.alertsCount + 1 : container.alertsCount
      }
    });

    logger.info(`Arduino update: fillLevel=${fillLevel}%, temp=${temperature}°C`);

    res.json({
      success: true,
      data: {
        fillLevel: updated.fillLevel,
        status: updated.status,
        alert: fillLevel >= 85 ? "CONTAINER_NEARLY_FULL" : null
      }
    });
  })
);

/**
 * GET /api/container/status
 * Returns current container state (used by Admin dashboard).
 */
router.get(
  "/status",
  asyncHandler(async (req, res) => {
    const container = await prisma.container.findFirst({
      where: { name: "ARDUINO_MAIN" }
    });

    if (!container) {
      return res.json({
        success: true,
        data: {
          fillLevel: 0,
          status: "OFFLINE",
          message: "Aucun conteneur Arduino connecté"
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: container.id,
        name: container.name,
        location: container.location,
        capacityLiters: container.capacityLiters,
        fillLevel: container.fillLevel,
        alertsCount: container.alertsCount,
        status: container.status,
        updatedAt: container.updatedAt
      }
    });
  })
);

module.exports = router;
