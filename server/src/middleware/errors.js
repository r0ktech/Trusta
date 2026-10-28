import { ZodError } from 'zod';
import multer from 'multer';
import { HttpError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'not_found', message: `No route for ${req.method} ${req.path}` } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'validation_failed',
        message: 'Some fields need attention.',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, ...(err.details && { details: err.details }) } });
  }
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    return res.status(tooBig ? 413 : 400).json({ error: { code: tooBig ? 'file_too_large' : 'upload_failed', message: err.message } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'invalid_json', message: 'Request body is not valid JSON.' } });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'payload_too_large', message: 'Request body is too large.' } });
  }
  // Prisma: unique constraint and missing record
  if (err?.code === 'P2002') return res.status(409).json({ error: { code: 'conflict', message: 'That already exists.' } });
  if (err?.code === 'P2025') return res.status(404).json({ error: { code: 'not_found', message: 'Resource not found.' } });

  (req.log ?? logger).error({ err }, 'Unhandled error');
  res.status(500).json({ error: { code: 'internal', message: 'Something went wrong on our side. Please try again.' } });
}
