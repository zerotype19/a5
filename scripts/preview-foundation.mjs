/** Stage only fictional UI fixtures. Never needed or included in a release build. */
import { mkdirSync, copyFileSync, existsSync, unlinkSync, rmdirSync } from 'node:fs';
const dir = 'src/app/admin/foundation-preview';
const file = `${dir}/page.tsx`;
if (process.argv.includes('--remove')) {
  if (existsSync(file)) unlinkSync(file);
  if (existsSync(dir)) rmdirSync(dir);
  console.log('Temporary visual fixture removed.');
} else {
  if (existsSync(file)) throw new Error('Fixture already staged; remove it before staging again.');
  mkdirSync(dir, { recursive: true });
  copyFileSync('tests/fixtures/foundation-preview.tsx', file);
  console.log('Development-only fixture staged at /admin/foundation-preview. Remove with --remove before building.');
}
