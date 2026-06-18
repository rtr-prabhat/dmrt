const UserService = require('./users.service');
const asyncWrap = require('../../utils/asyncWrap');
const { paginate, paginateMeta } = require('../../utils/paginate');

const list = asyncWrap(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { total, rows } = await UserService.list({ page, limit, offset, search: req.query.search });
  res.json({ success: true, data: rows, meta: paginateMeta(page, limit, total) });
});

const getOne = asyncWrap(async (req, res) => {
  const data = await UserService.getById(Number(req.params.id));
  res.json({ success: true, data });
});

const create = asyncWrap(async (req, res) => {
  const data = await UserService.create(req.body, req.user.id);
  res.status(201).json({ success: true, data });
});

const update = asyncWrap(async (req, res) => {
  const data = await UserService.update(Number(req.params.id), req.body);
  res.json({ success: true, data });
});

const remove = asyncWrap(async (req, res) => {
  await UserService.remove(Number(req.params.id), req.user.id);
  res.json({ success: true, data: { message: 'User deleted' } });
});

const setRoles = asyncWrap(async (req, res) => {
  const data = await UserService.setRoles(Number(req.params.id), req.body.roles, req.user.id);
  res.json({ success: true, data });
});

module.exports = { list, getOne, create, update, remove, setRoles };
