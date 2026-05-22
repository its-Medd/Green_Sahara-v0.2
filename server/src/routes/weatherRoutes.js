const express = require("express");
const weatherController = require("../controllers/weatherController");

const router = express.Router();

router.get("/farm/:id", weatherController.getFarmWeather);

module.exports = router;
