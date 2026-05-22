const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const updateLanguage = asyncHandler(async (req, res) => {
  const preferredLanguage = req.body.language === "ar" ? "ar" : "fr";
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { preferredLanguage }
  });

  res.json({
    success: true,
    data: {
      preferredLanguage: user.preferredLanguage
    }
  });
});

module.exports = {
  updateLanguage
};

