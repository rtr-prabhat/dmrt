const DashboardService = require('./dashboard.service');
const asyncWrap = require('../../utils/asyncWrap');

const summary = asyncWrap(async (req, res) => {
  const data = await DashboardService.getSummary(req.user.roles);
  res.json({ success: true, data });
});

module.exports = { summary };
