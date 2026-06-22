import { Warehouse, WarehouseInventory, ProductVariation, Product } from '../models/index.js';
import { sequelize } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { paginate, paginateMeta } from '../utils/paginate.js';

const list = async ({ page = 1, limit = 20, isActive } = {}) => {
  try {
    const { offset } = paginate({ page, limit });
    const where = {};
    if (isActive !== undefined) where.isActive = isActive;
    const { rows, count } = await Warehouse.findAndCountAll({ where, limit, offset, order: [['name', 'ASC']] });
    return { warehouses: rows, meta: paginateMeta(page, limit, count) };
  } catch (error) {
    console.log('Error in warehouse.list:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to list warehouses', 500);
  }
};

const getById = async (id) => {
  try {
    const wh = await Warehouse.findByPk(id);
    if (!wh) throw new AppError('Warehouse not found', 404, 'NOT_FOUND');
    return wh;
  } catch (error) {
    console.log('Error in warehouse.getById:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch warehouse', 500);
  }
};

const create = async (data) => {
  try {
    const existing = await Warehouse.findOne({ where: { code: data.code } });
    if (existing) throw new AppError('Warehouse code already exists', 409, 'CONFLICT');
    return Warehouse.create(data);
  } catch (error) {
    console.log('Error in warehouse.create:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create warehouse', 500);
  }
};

const update = async (id, data) => {
  try {
    const wh = await Warehouse.findByPk(id);
    if (!wh) throw new AppError('Warehouse not found', 404, 'NOT_FOUND');
    await wh.update(data);
    return wh;
  } catch (error) {
    console.log('Error in warehouse.update:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update warehouse', 500);
  }
};

const remove = async (id) => {
  try {
    const wh = await Warehouse.findByPk(id);
    if (!wh) throw new AppError('Warehouse not found', 404, 'NOT_FOUND');
    await wh.destroy();
  } catch (error) {
    console.log('Error in warehouse.remove:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete warehouse', 500);
  }
};

const getInventory = async (warehouseId) => {
  try {
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
  } catch (error) {
    console.log('Error in warehouse.getInventory:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch warehouse inventory', 500);
  }
};

const upsertInventory = async (warehouseId, items) => {
  try {
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
  } catch (error) {
    console.log('Error in warehouse.upsertInventory:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to upsert warehouse inventory', 500);
  }
};

export { list, getById, create, update, remove, getInventory, upsertInventory };
