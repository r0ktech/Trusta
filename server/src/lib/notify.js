import { prisma } from '../db.js';
import { logger } from './logger.js';

// In-app notifications. A failure here must never break the action that
// triggered it, so errors are logged and swallowed. Email/SMS fan-out would
// hook in here, respecting each user's saved notification preferences.
export async function notify(userId, { type, title, body, link }, db = prisma) {
  if (!userId) return;
  try {
    await db.notification.create({ data: { userId, type, title, body, link } });
  } catch (err) {
    logger.warn({ err, userId, type }, 'Failed to create notification');
  }
}
