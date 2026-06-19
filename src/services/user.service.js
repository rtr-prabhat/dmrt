const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User, Role, UserRole } = require('../models');
const { AppError } = require('../utils/AppError');
const { paginate, paginateMeta } = require('../utils/paginate');

const SALT_ROUNDS = 10;

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash', 'deletedAt'] },
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
};

const updateMe = async (userId, fields) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  await user.update(fields);
  const { passwordHash, deletedAt, ...data } = user.toJSON();
  return data;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AppError('Current password is incorrect', 400, 'BAD_REQUEST');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.update({ passwordHash });
};

const list = async ({ page, limit, search }) => {
  const { offset } = paginate({ page, limit });
  const where = search
    ? { [Op.or]: [{ fullName: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }] }
    : {};

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['passwordHash', 'deletedAt'] },
    include: [{ model: Role, as: 'roles', attributes: ['id', 'name'], through: { attributes: [] } }],
    limit,
    offset,
    distinct: true,
  });

  return { users: rows, meta: paginateMeta(page, limit, count) };
};

const getById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['passwordHash', 'deletedAt'] },
    include: [{ model: Role, as: 'roles', attributes: ['id', 'name'], through: { attributes: [] } }],
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
};

const create = async ({ fullName, email, password, roles }, actorId) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409, 'CONFLICT');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ fullName, email, passwordHash });

  const roleRecords = await Role.findAll({ where: { name: roles || ['user'] } });
  await Promise.all(roleRecords.map((r) => UserRole.create({ userId: user.id, roleId: r.id, grantedBy: actorId })));

  return getById(user.id);
};

const update = async (id, fields) => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  await user.update(fields);
  return getById(id);
};

const remove = async (id, actorId) => {
  if (Number(id) === Number(actorId)) throw new AppError('Cannot delete your own account', 400, 'BAD_REQUEST');
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  await user.destroy();
};

const setRoles = async (id, roleNames, actorId) => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  const roles = await Role.findAll({ where: { name: roleNames } });
  if (roles.length !== roleNames.length) throw new AppError('One or more roles not found', 400, 'BAD_REQUEST');

  await UserRole.destroy({ where: { userId: id } });
  await Promise.all(roles.map((r) => UserRole.create({ userId: id, roleId: r.id, grantedBy: actorId })));

  return getById(id);
};

module.exports = { getMe, updateMe, changePassword, list, getById, create, update, remove, setRoles };
