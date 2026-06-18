const ProductService = require('./products.service');
const asyncWrap = require('../../utils/asyncWrap');
const { paginate, paginateMeta } = require('../../utils/paginate');

const list = asyncWrap(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { total, rows } = await ProductService.list({ ...req.query, page, limit, offset });
  res.json({ success: true, data: rows, meta: paginateMeta(page, limit, total) });
});

const getOne = asyncWrap(async (req, res) => {
  const data = await ProductService.getById(Number(req.params.id));
  res.json({ success: true, data });
});

const create = asyncWrap(async (req, res) => {
  const data = await ProductService.create(req.body, req.user.id);
  res.status(201).json({ success: true, data });
});

const update = asyncWrap(async (req, res) => {
  const data = await ProductService.update(Number(req.params.id), req.body);
  res.json({ success: true, data });
});

const remove = asyncWrap(async (req, res) => {
  await ProductService.remove(Number(req.params.id));
  res.json({ success: true, data: { message: 'Product deleted' } });
});

module.exports = { list, getOne, create, update, remove };
