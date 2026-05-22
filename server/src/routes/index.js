const express = require("express");
const authRoutes = require("./authRoutes");
const farmerRoutes = require("./farmerRoutes");
const adminRoutes = require("./adminRoutes");
const containerRoutes = require("./containerRoutes");
const weatherRoutes = require("./weatherRoutes");
const impactRoutes = require("./impactRoutes");
const userRoutes = require("./userRoutes");
const arduinoRoutes = require("./arduinoRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Green Sahara API is healthy" });
});

router.use("/auth", authRoutes);
router.use("/farmer", farmerRoutes);
router.use("/admin", adminRoutes);
router.use("/container", containerRoutes);
router.use("/weather", weatherRoutes);
router.use("/impact", impactRoutes);
router.use("/users", userRoutes);
router.use("/arduino", arduinoRoutes);

module.exports = router;

