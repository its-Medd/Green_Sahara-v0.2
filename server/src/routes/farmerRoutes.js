const express = require("express");
const farmerController = require("../controllers/farmerController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("FARMER"));

router.get("/dashboard", farmerController.getDashboard);
router.get("/profile", farmerController.getProfile);
router.put("/profile", farmerController.updateProfile);
router.get("/products", farmerController.getProducts);
router.get("/orders", farmerController.getOrders);
router.get("/insights", farmerController.getInsights);
router.get("/alerts", farmerController.getAlerts);
router.post("/cart/add", farmerController.addToCart);
router.post("/orders/create", farmerController.createOrder);
router.get("/ai/history", farmerController.getAiHistory);
router.post("/ai/chat", farmerController.postAiChat);
router.post("/ai/chat/stream", farmerController.postAiChatStream);
router.post("/ai/analyze", farmerController.postAiAnalyze);
router.post("/ai/reset", farmerController.resetAiConversation);

module.exports = router;
