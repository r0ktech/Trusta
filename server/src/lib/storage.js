import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { config } from '../config.js';
import { badRequest } from './errors.js';

// Image storage on local disk, served from /uploads. Every upload is decoded
// and re-encoded by sharp, which strips EXIF (including GPS location),
// normalises orientation, caps the size and rejects anything that isn't a
// real image whatever its extension claims. Swap `put`/`remove` for an
// object-storage client (S3, R2, GCS) in production.

export const uploadRoot = path.resolve(config.UPLOAD_DIR);
const MAX_EDGE = 1600;
const ALLOWED = new Set(['jpeg', 'png', 'webp', 'heif', 'avif']);

export async function saveImage(buffer) {
  let meta;
  try {
    meta = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw badRequest('That file isn’t a supported image.');
  }
  if (!ALLOWED.has(meta.format)) throw badRequest('Use a JPG, PNG, WebP or HEIC image.');

  const { data, info } = await sharp(buffer, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer({ resolveWithObject: true });

  const name = `${randomUUID()}.webp`;
  await mkdir(uploadRoot, { recursive: true });
  await writeFile(path.join(uploadRoot, name), data, { flag: 'wx' });
  return { url: `/uploads/${name}`, width: info.width, height: info.height, bytes: info.size };
}

export async function removeImage(url) {
  const name = path.basename(url ?? '');
  if (!/^[a-z0-9-]+\.webp$/i.test(name)) return;
  await unlink(path.join(uploadRoot, name)).catch(() => {});
}
