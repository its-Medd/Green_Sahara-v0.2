const passportLib = require("passport");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");
const { signToken } = require("../utils/token");
const authService = require("../services/authService");
const { isGoogleConfigured } = require("../config/passport");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.cookie("token", data.token, cookieOptions);
  res.status(201).json({ success: true, data });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.cookie("token", data.token, cookieOptions);
  res.json({ success: true, data });
});

const adminLogin = asyncHandler(async (req, res) => {
  const data = await authService.loginAdmin(req.body);
  res.cookie("token", data.token, cookieOptions);
  res.json({ success: true, data });
});

const googleTokenLogin = asyncHandler(async (req, res) => {
  const data = await authService.loginWithGoogleToken(req.body);
  res.cookie("token", data.token, cookieOptions);
  res.json({ success: true, data });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: user });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Déconnecté" });
});

const googleRedirect = (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.status(503).json({
      success: false,
      message: "Google OAuth n'est pas configuré côté serveur"
    });
  }
  return passportLib.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })(req, res, next);
};

const googleCallback = [
  (req, res, next) => {
    if (!isGoogleConfigured) {
      return res.status(503).json({
        success: false,
        message: "Google OAuth n'est pas configuré côté serveur"
      });
    }
    return passportLib.authenticate("google", {
      session: false,
      failureRedirect: `${env.clientUrl}/login?error=google_auth`
    })(req, res, next);
  },
  (req, res) => {
    const token = signToken({ userId: req.user.id, role: req.user.role });
    res.cookie("token", token, cookieOptions);
    res.redirect(
      `${env.clientUrl}/auth/callback?token=${token}&role=${req.user.role}&redirect=${encodeURIComponent(
        authService.buildRedirectPath(req.user.role)
      )}`
    );
  }
];

module.exports = {
  register,
  login,
  adminLogin,
  googleTokenLogin,
  me,
  logout,
  googleRedirect,
  googleCallback
};
