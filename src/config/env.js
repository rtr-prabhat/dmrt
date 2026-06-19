require('dotenv').config();
const { cleanEnv, str, port, num, url } = require('envalid');

module.exports = cleanEnv(process.env, {
  NODE_ENV:            str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT:                port({ default: 3000 }),

  DB_HOST:             str({ default: 'localhost' }),
  DB_PORT:             num({ default: 3306 }),
  DB_NAME:             str(),
  DB_USER:             str(),
  DB_PASSWORD:         str(),
  DB_POOL_MIN:         num({ default: 2 }),
  DB_POOL_MAX:         num({ default: 20 }),

  // REDIS_URL:           url({ default: 'redis://localhost:6379' }),

  JWT_ACCESS_SECRET:   str(),
  JWT_REFRESH_SECRET:  str(),
  JWT_ACCESS_EXPIRES:  num({ default: 900 }),
  JWT_REFRESH_EXPIRES: num({ default: 2592000 }),

  LOG_LEVEL:           str({ default: 'info' }),
});
