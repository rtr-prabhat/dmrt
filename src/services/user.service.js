import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { User, Role, UserRole } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { paginate, paginateMeta } from '../utils/paginate.js';

const SALT_ROUNDS = 10;

const getMe = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash', 'deletedAt'] },
    });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return user;
  } catch (error) {
    console.log('Error in user.getMe:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch user', 500);
  }
};

const updateMe = async (userId, fields) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    await user.update(fields);
    const { passwordHash, deletedAt, ...data } = user.toJSON();
    return data;
  } catch (error) {
    console.log('Error in user.updateMe:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update profile', 500);
  }
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Current password is incorrect', 400, 'BAD_REQUEST');

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.update({ passwordHash });
  } catch (error) {
    console.log('Error in user.changePassword:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to change password', 500);
  }
};

const list = async ({ page, limit, search }) => {
  try {
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
  } catch (error) {
    console.log('Error in user.list:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to list users', 500);
  }
};

const getById = async (id) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash', 'deletedAt'] },
      include: [{ model: Role, as: 'roles', attributes: ['id', 'name'], through: { attributes: [] } }],
    });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return user;
  } catch (error) {
    console.log('Error in user.getById:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch user', 500);
  }
};

const create = async ({ fullName, email, password, roles }, actorId) => {
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409, 'CONFLICT');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ fullName, email, passwordHash });

    const roleRecords = await Role.findAll({ where: { name: roles || ['user'] } });
    await Promise.all(roleRecords.map((r) => UserRole.create({ userId: user.id, roleId: r.id, grantedBy: actorId })));

    return getById(user.id);
  } catch (error) {
    console.log('Error in user.create:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create user', 500);
  }
};

const update = async (id, fields) => {
  try {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    await user.update(fields);
    return getById(id);
  } catch (error) {
    console.log('Error in user.update:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update user', 500);
  }
};

const remove = async (id, actorId) => {
  try {
    if (Number(id) === Number(actorId)) throw new AppError('Cannot delete your own account', 400, 'BAD_REQUEST');
    const user = await User.findByPk(id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    await user.destroy();
  } catch (error) {
    console.log('Error in user.remove:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete user', 500);
  }
};

const setRoles = async (id, roleNames, actorId) => {
  try {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const roles = await Role.findAll({ where: { name: roleNames } });
    if (roles.length !== roleNames.length) throw new AppError('One or more roles not found', 400, 'BAD_REQUEST');

    await UserRole.destroy({ where: { userId: id } });
    await Promise.all(roles.map((r) => UserRole.create({ userId: id, roleId: r.id, grantedBy: actorId })));

    return getById(id);
  } catch (error) {
    console.log('Error in user.setRoles:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to set user roles', 500);
  }
};

export { getMe, updateMe, changePassword, list, getById, create, update, remove, setRoles };
