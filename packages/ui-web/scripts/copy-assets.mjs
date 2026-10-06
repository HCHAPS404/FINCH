// tsc only emits .js/.d.ts for .ts/.tsx — it does not copy the .module.css and .svg
// files components import by relative path. Without this, dist/ compiles but every
// consumer's bundler fails to resolve those imports at the published paths.
import { cpSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, '..', 'src');
const distDir = join(root, '..', 'dist');

const ASSET_EXTENSIONS = ['.css', '.svg'];

function copyAssets(dir) {
  for (const entry of readdirSync(dir)) {
    const srcPath = join(dir, entry);
    if (statSync(srcPath).isDirectory()) {
      copyAssets(srcPath);
      continue;
    }
    if (ASSET_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      const relative = srcPath.slice(srcDir.length + 1);
      const destPath = join(distDir, relative);
      mkdirSync(dirname(destPath), { recursive: true });
      cpSync(srcPath, destPath);
    }
  }
}

copyAssets(srcDir);
