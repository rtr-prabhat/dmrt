const { Address } = require('../models');
const { AppError } = require('../utils/AppError');

const list = async (userId) => {
  return Address.findAll({
    where: { userId },
    order: [['isDefault', 'DESC'], ['createdAt', 'ASC']],
  });
};

const create = async (userId, data) => {
  if (data.isDefault) {
    await Address.update({ isDefault: false }, { where: { userId } });
  }
  return Address.create({ ...data, userId, isDefault: !!data.isDefault });
};

const update = async (userId, id, data) => {
  console.log(id,'iddddddddd',userId,'[[[[[[[[[[[[')
  const address = await Address.findOne({ where: { id, userId } });
  if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');
  
  console.log(address,'adressssssssssss')
  await Address.update(data,{where:{id:address.id}})
  // await address.update(data);
  return address;
};

const remove = async (userId, id) => {
  const address = await Address.findOne({ where: { id, userId } });
  if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');
  await address.destroy();
};

const setDefault = async (userId, id) => {
  const address = await Address.findOne({ where: { id, userId } });
  if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');
  await Address.update({ isDefault: false }, { where: { userId } });
  await address.update({ isDefault: true });
  return address;
};

module.exports = { list, create, update, remove, setDefault };
