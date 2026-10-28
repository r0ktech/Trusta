// Prisma CLI configuration (Prisma 7). The CLI doesn't read .env by itself,
// so load it here; the app itself uses `node --env-file`.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    // Optional here so `prisma generate` (run on npm install) works before
    // .env exists; migrate commands still fail clearly without it.
    url: process.env.DATABASE_URL,
  },
});
