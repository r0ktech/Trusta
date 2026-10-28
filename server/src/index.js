import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './db.js';
import { logger } from './lib/logger.js';

const app = createApp();
const server = app.listen(config.PORT, () => {
  logger.info(`Trusta API listening on http://localhost:${config.PORT}/api`);
});

// Housekeeping: drop expired sessions and reset tokens once an hour.
const sweep = setInterval(async () => {
  const now = new Date();
  try {
    await prisma.session.deleteMany({ where: { expiresAt: { lt: now } } });
    await prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } });
  } catch (err) {
    logger.warn({ err }, 'Cleanup sweep failed');
  }
}, 60 * 60 * 1000);
sweep.unref();

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
