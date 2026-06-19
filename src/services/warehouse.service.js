const { Warehouse, WarehouseInventory, ProductVariation, Product } = require('../models');
const { sequelize } = require('../models');
const { AppError } = require('../utils/AppError');
const { paginate, paginateMeta } = require('../utils/paginate');

const list = async ({ page = 1, limit = 20, isActive } = {}) => {
  const { offset } = paginate({ page, limit });
  const where = {};
  if (isActive !== undefined) where.isActive = isActive;
  const { rows, count } = await Warehouse.findAndCountAll({ where, limit, offset, order: [['name', 'ASC']] });
  return { warehouses: rows, meta: paginateMeta(page, limit, count) };
};

const getById = async (id) => {
  const wh = await Warehouse.findByPk(id);
  if (!wh) throw new AppError('Warehouse not found', 404, 'NOT_FOUND');
  return wh;
};

const create = async (data) => {
  const existing = await Warehouse.findOne({ where: { code: data.code } });
  if (existing) throw new AppError('Warehouse code already exists', 409, 'CONFLICT');
  return Warehouse.create(data);
};

const update = async (id, data) => {
  const wh = await Warehouse.findByPk(id);
  if (!wh) throw new AppError('Warehouse not found', 404, 'NOT_FOUND');
  await wh.update(data);
  return wh;
};

const remove = async (id) => {
  const wh = await Warehouse.findByPk(id);
  if (!wh) throw new AppError('Warehouse not found', 404, 'NOT_FOUND');
  await wh.destroy();
};

const getInventory = async (warehouseId) => {
  await getById(warehouseId);
  return WarehouseInventory.findAll({
    where: { warehouseId },
    include: [{
      model: ProductVariation,
      as: 'variation',
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }],
    }],
    order: [['quantity', 'ASC']],
  });
};

const upsertInventory = async (warehouseId, items) => {
  await getById(warehouseId);
  const placeholders = items.map(() => '(?, ?, ?, ?, NOW(), NOW())').join(', ');
  const flatValues = items.flatMap(i => [warehouseId, i.variationId, i.quantity, i.reorderLevel ?? 0]);
  await sequelize.query(
    `INSERT INTO warehouse_inventory (warehouse_id, variation_id, quantity, reorder_level, created_at, updated_at)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       quantity = VALUES(quantity),
       reorder_level = VALUES(reorder_level),
       updated_at = NOW()`,
    { replacements: flatValues }
  );
  return getInventory(warehouseId);
};

module.exports = { list, getById, create, update, remove, getInventory, upsertInventory };
