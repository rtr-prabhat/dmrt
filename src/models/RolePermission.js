import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RolePermission = sequelize.define('RolePermission', {
  id:           { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  roleId:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  permissionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, {
  tableName:  'role_permissions',
  underscored: true,
  updatedAt:  false,
});

export default RolePermission;
