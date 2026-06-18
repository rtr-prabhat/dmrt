const AuthService = require('./auth.service');
const asyncWrap = require('../../utils/asyncWrap');

const register = asyncWrap(async (req, res) => {
  const data = await AuthService.register(req.body);
  res.status(201).json({ success: true, data });
});

const login = asyncWrap(async (req, res) => {
  const data = await AuthService.login({
    ...req.body,
    userAgent:  req.headers['user-agent'],
    ipAddress:  req.ip,
  });
  res.json({ success: true, data });
});

const refresh = asyncWrap(async (req, res) => {
  const data = await AuthService.refresh({ rawRefreshToken: req.body.refreshToken });
  res.json({ success: true, data });
});

const logout = asyncWrap(async (req, res) => {
  await AuthService.logout({
    accessToken:     req.token,
    rawRefreshToken: req.body.refreshToken,
    userId:          req.user.id,
  });
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

const logoutAll = asyncWrap(async (req, res) => {
  await AuthService.logoutAll({ accessToken: req.token, userId: req.user.id });
  res.json({ success: true, data: { message: 'All sessions terminated' } });
});

module.exports = { register, login, refresh, logout, logoutAll };
