import { fileURLToPath } from 'url';
import path       from 'path';
import express    from 'express';
import helmet     from 'helmet';
import cors       from 'cors';
import pinoHttp   from 'pino-http';
import rateLimit  from 'express-rate-limit';

import env          from './config/env.js';
import logger       from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';
import apiRouter    from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// app.use(pinoHttp({ logger }));

// ── Serve uploaded files ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
if (process.argv[1] === __filename) {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  process.on('unhandledRejection', (err) => {
    logger.fatal({ err }, 'Unhandled promise rejection — shutting down');
    process.exit(1);
  });
}
export default app;
