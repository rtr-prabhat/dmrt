const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  label:     { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'Home' },
  line1:     { type: DataTypes.STRING(255), allowNull: false },
  line2:     { type: DataTypes.STRING(255), allowNull: true },
  city:      { type: DataTypes.STRING(100), allowNull: false },
  state:     { type: DataTypes.STRING(100), allowNull: false },
  pincode:   { type: DataTypes.STRING(6), allowNull: false },
  phone:     { type: DataTypes.STRING(20), allowNull: false },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName:  'addresses',
  paranoid:   true,
  underscored: true,
});

module.exports = Address;
