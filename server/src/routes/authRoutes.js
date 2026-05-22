const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const validateMiddleware = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("role").isIn(["provider", "farmer", "PROVIDER", "FARMER"]),
    body("city").optional({ checkFalsy: true }).isString(),
    body("region").optional({ checkFalsy: true }).isString(),
    body("surfaceHectares").optional({ checkFalsy: true }).isNumeric(),
    body("equipment").optional({ checkFalsy: true }).isString(),
    body("farmName").optional({ checkFalsy: true }).isString(),
    body("mainCrops").optional({ checkFalsy: true }).isString(),
    body("climate").optional({ checkFalsy: true }).isString(),
    body("establishmentName").optional({ checkFalsy: true }).isString(),
    body("address").optional({ checkFalsy: true }).isString(),
    body("wasteType").optional({ checkFalsy: true }).isString()
  ],
  validateMiddleware,
  authController.register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validateMiddleware,
  authController.login
);
router.post(
  "/admin-login",
  [body("email").isEmail(), body("password").notEmpty()],
  validateMiddleware,
  authController.adminLogin
);

router.post("/google", authController.googleTokenLogin);
router.get("/google/redirect", authController.googleRedirect);
router.get("/google/callback", authController.googleCallback);
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
