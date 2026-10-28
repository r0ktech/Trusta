import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';

// argon2id with the library's recommended defaults (OWASP-aligned).
export const hashPassword = (password) => argon2.hash(password, { type: argon2.argon2id });

export async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// A hash we can verify against when the account doesn't exist, so a login
// attempt takes the same time whether or not the email is registered.
let dummyHash;
export async function burnPasswordCheck(password) {
  dummyHash ??= await hashPassword('timing-equaliser-not-a-real-password');
  await verifyPassword(dummyHash, password);
}

/** 256-bit random token, URL-safe. Give the raw value to the client, store only its hash. */
export const randomToken = () => randomBytes(32).toString('base64url');

export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
