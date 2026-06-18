const pino = require('pino');
const env = require('../config/env');

module.exports = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development' && {
    transport: { target: 'pino/file', options: { destination: 1 } },
  }),
});
