const express = require("express");
const impactController = require("../controllers/impactController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/summary", authMiddleware, impactController.summary);

module.exports = router;

