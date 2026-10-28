// Brings the test database up to date and seeds it. Run with the test env
// loaded (see the "pretest" script), so DATABASE_URL points at trusta_test.
import { execSync } from 'node:child_process';

if (!process.env.DATABASE_URL) {
  console.error('Missing .env.test — copy .env.test.example to .env.test and set your database user.');
  process.exit(1);
}
if (!process.env.DATABASE_URL.includes('test')) {
  console.error('Refusing to prepare a database whose URL does not contain "test".');
  process.exit(1);
}
const run = (cmd) => execSync(cmd, { stdio: 'inherit', env: process.env });
run('npx prisma migrate deploy');
run('node prisma/seed.js');
