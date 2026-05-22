const express = require("express");
const providerController = require("../controllers/providerController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("PROVIDER"));

router.get("/dashboard", providerController.getDashboard);
router.get("/containers", providerController.getContainers);
router.get("/transport-status", providerController.getTransportStatus);
router.get("/profile", providerController.getProfile);
router.put("/profile", providerController.updateProfile);

module.exports = router;
