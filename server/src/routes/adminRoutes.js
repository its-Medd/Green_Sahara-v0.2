const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/dashboard", adminController.getDashboard);
router.post("/analysis", adminController.postAnalysis);
router.get("/lots", adminController.getLots);
router.get("/statistics", adminController.getStatistics);
router.post("/lots", adminController.createLot);
router.put("/lots/:id", adminController.updateLot);
router.delete("/lots/:id", adminController.deleteLot);
router.get("/orders/pending", adminController.getPendingOrders);
router.put("/orders/:id/confirm", adminController.confirmOrder);

module.exports = router;
