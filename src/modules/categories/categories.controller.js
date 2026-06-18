const CategoryService = require('./categories.service');
const asyncWrap = require('../../utils/asyncWrap');
const { paginate, paginateMeta } = require('../../utils/paginate');

const list = asyncWrap(async (req, res) => {
  const { page, limit, offset } = paginate(req.query);
  const { total, rows } = await CategoryService.list({
    page, limit, offset, isActive: req.query.isActive,
  });
  res.json({ success: true, data: rows, meta: paginateMeta(page, limit, total) });
});

const tree = asyncWrap(async (_req, res) => {
  const data = await CategoryService.tree();
  res.json({ success: true, data });
});

const getOne = asyncWrap(async (req, res) => {
  const data = await CategoryService.getById(Number(req.params.id));
  res.json({ success: true, data });
});

const getDescendants = asyncWrap(async (req, res) => {
  const data = await CategoryService.descendants(Number(req.params.id));
  res.json({ success: true, data });
});

const create = asyncWrap(async (req, res) => {
  const data = await CategoryService.create(req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncWrap(async (req, res) => {
  const data = await CategoryService.update(Number(req.params.id), req.body);
  res.json({ success: true, data });
});

const remove = asyncWrap(async (req, res) => {
  await CategoryService.remove(Number(req.params.id));
  res.json({ success: true, data: { message: 'Category deleted' } });
});

module.exports = { list, tree, getOne, getDescendants, create, update, remove };
