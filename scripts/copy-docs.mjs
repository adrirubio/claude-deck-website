// Copy the generated documentation tree verbatim into the Astro output.
// docs/ is generated from the product repository and must be served
// unchanged; this script never edits it, it only mirrors it into dist/.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'docs');
const target = join(root, 'dist', 'docs');

if (!existsSync(source)) {
  console.error('copy-docs: docs/ directory is missing');
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log('copy-docs: docs/ copied verbatim into dist/docs/');
