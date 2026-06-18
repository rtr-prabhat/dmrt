const VariationService = require('./variations.service');
const asyncWrap = require('../../utils/asyncWrap');

const list = asyncWrap(async (req, res) => {
  const data = await VariationService.list(Number(req.params.productId));
  res.json({ success: true, data });
});

const getOne = asyncWrap(async (req, res) => {
  const data = await VariationService.getById(
    Number(req.params.productId),
    Number(req.params.id)
  );
  res.json({ success: true, data });
});

const create = asyncWrap(async (req, res) => {
  const data = await VariationService.create(Number(req.params.productId), req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncWrap(async (req, res) => {
  const data = await VariationService.update(
    Number(req.params.productId),
    Number(req.params.id),
    req.body
  );
  res.json({ success: true, data });
});

const remove = asyncWrap(async (req, res) => {
  await VariationService.remove(Number(req.params.productId), Number(req.params.id));
  res.json({ success: true, data: { message: 'Variation deleted' } });
});

module.exports = { list, getOne, create, update, remove };
