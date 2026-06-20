const { Address } = require('../models');
const { AppError } = require('../utils/AppError');

const list = async (userId) => {
  try {
    return Address.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch addresses', 500);
  }
};

const create = async (userId, data) => {
  try {
    if (data.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId } });
    }
    return Address.create({ ...data, userId, isDefault: !!data.isDefault });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create address', 500);
  }
};

const update = async (userId, id, data) => {
  try {
    const address = await Address.findOne({ where: { id, userId } });
    if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');

    await Address.update(data,{where:{id:address.id}})
    return address;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update address', 500);
  }
};

const remove = async (userId, id) => {
  try {
    const address = await Address.findOne({ where: { id, userId } });
    if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');
    await address.destroy();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete address', 500);
  }
};

const setDefault = async (userId, id) => {
  try {
    const address = await Address.findOne({ where: { id, userId } });
    if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');
    await Address.update({ isDefault: false }, { where: { userId } });
    await address.update({ isDefault: true });
    return address;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to set default address', 500);
  }
};

module.exports = { list, create, update, remove, setDefault };
