const { AppError } = require('../../utils/AppError');
const WarehouseRepository = require('./warehouses.repository');

async function list({ page, limit, offset, isActive }) {
  return WarehouseRepository.findAll({ limit, offset, isActive });
}

async function getById(id) {
  const warehouse = await WarehouseRepository.findById(id);
  if (!warehouse) throw new AppError('Warehouse not found', 404);
  const inventorySummary = await WarehouseRepository.findInventory(id);
  return { ...warehouse, inventory: inventorySummary };
}

async function create({ name, code, address, city, state, pincode }, createdBy) {
  const existing = await WarehouseRepository.findByCode(code);
  if (existing) throw new AppError(`Warehouse code '${code}' already exists`, 409);
  const id = await WarehouseRepository.create({ name, code, address, city, state, pincode, createdBy });
  return WarehouseRepository.findById(id);
}

async function update(id, payload) {
  const warehouse = await WarehouseRepository.findById(id);
  if (!warehouse) throw new AppError('Warehouse not found', 404);

  if (payload.code && payload.code !== warehouse.code) {
    const existing = await WarehouseRepository.findByCode(payload.code);
    if (existing) throw new AppError(`Warehouse code '${payload.code}' already exists`, 409);
  }

  const fields = {};
  if (payload.name     !== undefined) fields.name     = payload.name;
  if (payload.code     !== undefined) fields.code     = payload.code;
  if (payload.address  !== undefined) fields.address  = payload.address;
  if (payload.city     !== undefined) fields.city     = payload.city;
  if (payload.state    !== undefined) fields.state    = payload.state;
  if (payload.pincode  !== undefined) fields.pincode  = payload.pincode;
  if (payload.isActive !== undefined) fields.is_active = payload.isActive;

  await WarehouseRepository.update(id, fields);
  return WarehouseRepository.findById(id);
}

async function getInventory(id) {
  const warehouse = await WarehouseRepository.findById(id);
  if (!warehouse) throw new AppError('Warehouse not found', 404);
  return WarehouseRepository.findInventory(id);
}

async function upsertInventory(id, items) {
  const warehouse = await WarehouseRepository.findById(id);
  if (!warehouse) throw new AppError('Warehouse not found', 404);
  await WarehouseRepository.upsertInventory(id, items);
  return WarehouseRepository.findInventory(id);
}

async function remove(id) {
  const warehouse = await WarehouseRepository.findById(id);
  if (!warehouse) throw new AppError('Warehouse not found', 404);
  await WarehouseRepository.softDelete(id);
}

module.exports = { list, getById, create, update, getInventory, upsertInventory, remove };
