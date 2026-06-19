const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger');

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  timezone: '+00:00',
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
  },
  logging: env.NODE_ENV === 'development' ? (sql) => logger.debug(sql) : false,
  define: {
    underscored: true,
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
});

module.exports = sequelize;
