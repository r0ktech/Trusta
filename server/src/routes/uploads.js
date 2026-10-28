import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/security.js';
import { saveImage } from '../lib/storage.js';
import { badRequest } from '../lib/errors.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024, files: 1, fields: 5, parts: 6 },
});

/** POST /uploads (multipart, field "image") → { url, width, height } */
router.post('/', requireAuth, writeLimiter, upload.single('image'), async (req, res) => {
  if (!req.file) throw badRequest('Attach an image in the "image" field.');
  const saved = await saveImage(req.file.buffer);
  await prisma.upload.create({ data: { userId: req.user.id, ...saved } });
  res.status(201).json({ url: saved.url, width: saved.width, height: saved.height });
});

export default router;

/** Throws unless every URL is an upload that belongs to this user. */
export async function assertOwnUploads(userId, urls) {
  const wanted = [...new Set(urls.filter(Boolean))];
  if (!wanted.length) return;
  const owned = await prisma.upload.count({ where: { userId, url: { in: wanted } } });
  if (owned !== wanted.length) throw badRequest('One or more images weren’t uploaded by you.');
}
