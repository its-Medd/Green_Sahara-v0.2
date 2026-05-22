const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const summary = asyncHandler(async (req, res) => {
  if (req.user) {
    const stat = await prisma.impactStat.findFirst({ where: { userId: req.user.id } });
    return res.json({
      success: true,
      data: {
        co2Saved: stat?.co2Saved || 0,
        treesEquivalent: stat?.treesEquivalent || 0,
        performanceRate: stat?.performanceRate || 0
      }
    });
  }

  const aggregate = await prisma.impactStat.aggregate({
    _sum: { co2Saved: true, treesEquivalent: true },
    _avg: { performanceRate: true }
  });

  return res.json({
    success: true,
    data: {
      co2Saved: aggregate._sum.co2Saved || 0,
      treesEquivalent: aggregate._sum.treesEquivalent || 0,
      performanceRate: Number(aggregate._avg.performanceRate || 0).toFixed(1)
    }
  });
});

module.exports = {
  summary
};

