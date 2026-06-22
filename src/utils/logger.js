import pino from 'pino';
import env from '../config/env.js';

export default pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development' && {
    transport: { target: 'pino/file', options: { destination: 1 } },
  }),
});
