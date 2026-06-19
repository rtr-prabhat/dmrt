const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const pinoHttp   = require('pino-http');
const rateLimit  = require('express-rate-limit');

const env          = require('./config/env');
const logger       = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { AppError } = require('./utils/AppError');
const apiRouter    = require('./routes/index');

const app = express();

// ── Security headers ──────────────────────────────────────────
app.use(helmet());
app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)
    : true,
  credentials: true,
}));

// ── Logging ───────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Global rate limiter ───────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
}));

// ── Auth-specific stricter limiter ────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many auth attempts' } },
});

// Apply auth rate limiter only to auth routes
app.use('/api/v1/auth', authLimiter);

// ── API Routes ────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, _res, next) => next(new AppError('Route not found', 404)));

// ── Centralised error handler (must be last) ──────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  process.on('unhandledRejection', (err) => {
    logger.fatal({ err }, 'Unhandled promise rejection — shutting down');
    process.exit(1);
  });
}

module.exports = app;
