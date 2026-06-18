const argon2 = require('argon2');
const { AppError } = require('../../utils/AppError');
const UserRepository = require('./users.repository');

const ARGON2_OPTIONS = { type: argon2.argon2id, timeCost: 3, memoryCost: 65536, parallelism: 4 };

async function list({ page, limit, offset, search }) {
  return UserRepository.findAll({ limit, offset, search });
}

async function getById(id) {
  const user = await UserRepository.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
}

async function create({ fullName, email, password, roles }, actorId) {
  const passwordHash = await argon2.hash(password, ARGON2_OPTIONS);
  const userId = await UserRepository.create({ email, passwordHash, fullName });
  await UserRepository.setRoles(userId, roles, actorId);
  return UserRepository.findById(userId);
}

async function update(id, { fullName, isActive }) {
  const user = await UserRepository.findById(id);
  if (!user) throw new AppError('User not found', 404);

  const fields = {};
  if (fullName  !== undefined) fields.full_name = fullName;
  if (isActive  !== undefined) fields.is_active = isActive;

  await UserRepository.update(id, fields);
  return UserRepository.findById(id);
}

async function remove(id, actorId) {
  if (id === actorId) throw new AppError('Cannot delete your own account', 400);
  const user = await UserRepository.findById(id);
  if (!user) throw new AppError('User not found', 404);
  await UserRepository.softDelete(id);
}

async function setRoles(id, roles, actorId) {
  const user = await UserRepository.findById(id);
  if (!user) throw new AppError('User not found', 404);
  await UserRepository.setRoles(id, roles, actorId);
  return UserRepository.findById(id);
}

module.exports = { list, getById, create, update, remove, setRoles };
