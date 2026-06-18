const WarehouseService = require('./warehouses.service');
const asyncWrap = require('../../utils/asyncWrap');
const { paginate, paginateMeta } = require('../../utils/paginate');

const list = asyncWrap(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { total, rows } = await WarehouseService.list({ page, limit, offset, isActive: req.query.isActive });
  res.json({ success: true, data: rows, meta: paginateMeta(page, limit, total) });
});

const getOne = asyncWrap(async (req, res) => {
  const data = await WarehouseService.getById(Number(req.params.id));
  res.json({ success: true, data });
});

const create = asyncWrap(async (req, res) => {
  const data = await WarehouseService.create(req.body, req.user.id);
  res.status(201).json({ success: true, data });
});

const update = asyncWrap(async (req, res) => {
  const data = await WarehouseService.update(Number(req.params.id), req.body);
  res.json({ success: true, data });
});

const getInventory = asyncWrap(async (req, res) => {
  const data = await WarehouseService.getInventory(Number(req.params.id));
  res.json({ success: true, data });
});

const upsertInventory = asyncWrap(async (req, res) => {
  const data = await WarehouseService.upsertInventory(Number(req.params.id), req.body.items);
  res.json({ success: true, data });
});

const remove = asyncWrap(async (req, res) => {
  await WarehouseService.remove(Number(req.params.id));
  res.json({ success: true, data: { message: 'Warehouse deleted' } });
});

module.exports = { list, getOne, create, update, getInventory, upsertInventory, remove };
