import { config } from '../config.js';
import { logger } from './logger.js';

// Email delivery. No provider is configured yet, so messages are logged
// (and kept in memory for tests). Replace `deliver` with an SMTP or
// transactional-email API call when one is chosen.
//
// Bodies can contain secrets (password-reset links), so they are only logged
// outside production.

export const outbox = [];

async function deliver(message) {
  if (config.isProd) {
    logger.warn({ to: message.to, subject: message.subject }, 'Email not sent: no email provider configured');
  } else {
    logger.info({ to: message.to, subject: message.subject }, `Email (dev, not sent):\n${message.text}`);
  }
}

export async function sendEmail({ to, subject, text }) {
  const message = { to, subject, text, at: new Date() };
  if (!config.isProd) {
    outbox.push(message);
    if (outbox.length > 50) outbox.shift();
  }
  await deliver(message);
}
