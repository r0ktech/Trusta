import pino from 'pino';
import { config } from '../config.js';

export const logger = pino({
  level: config.isTest ? 'silent' : config.LOG_LEVEL,
  redact: {
    paths: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]', '*.password', '*.passwordHash', '*.token'],
    censor: '[redacted]',
  },
});
