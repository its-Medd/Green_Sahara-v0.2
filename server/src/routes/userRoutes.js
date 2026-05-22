const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.put("/language", authMiddleware, userController.updateLanguage);

module.exports = router;

