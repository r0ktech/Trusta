import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { config } from './config.js';
import { prisma } from './db.js';
import { logger } from './lib/logger.js';
import { loadSession } from './middleware/auth.js';
import { checkOrigin, apiLimiter } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { uploadRoot } from './lib/storage.js';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import catalogRoutes from './routes/catalog.js';
import artisanRoutes from './routes/artisans.js';
import providerRoutes from './routes/provider.js';
import bookingRoutes from './routes/bookings.js';
import savedRoutes from './routes/saved.js';
import conversationRoutes from './routes/conversations.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/uploads.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY);

  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }));
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || config.allowedOrigins.includes(origin)),
      credentials: true,
      maxAge: 600,
    }),
  );

  // Uploaded images: immutable (random names), never sniffed as other types.
  app.use(
    '/uploads',
    express.static(uploadRoot, {
      immutable: true,
      maxAge: '365d',
      index: false,
      setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
    }),
  );

  const api = express.Router();
  api.use(express.json({ limit: '100kb' }));
  api.use(cookieParser());
  api.use(apiLimiter);
  api.use(checkOrigin);
  api.use(loadSession);
  api.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  api.get('/health', async (_req, res) => {
    await prisma.$queryRaw`select 1`;
    res.json({ ok: true });
  });

  api.use('/auth', authRoutes);
  api.use('/me', meRoutes);
  api.use('/', catalogRoutes);
  api.use('/artisans', artisanRoutes);
  api.use('/provider', providerRoutes);
  api.use('/bookings', bookingRoutes);
  api.use('/saved', savedRoutes);
  api.use('/conversations', conversationRoutes);
  api.use('/notifications', notificationRoutes);
  api.use('/uploads', uploadRoutes);
  api.use('/admin', adminRoutes);

  app.use('/api', api);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
