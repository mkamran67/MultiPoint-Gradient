import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

const firefoxOnly = process.argv.includes('--firefox-only');

function buildFirefox() {
  const firefoxDist = resolve(root, 'dist-firefox');
  if (existsSync(dist)) {
    cpSync(dist, firefoxDist, { recursive: true });
  }

  const manifestPath = resolve(firefoxDist, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  // Firefox MV3 uses background.scripts instead of service_worker
  if (manifest.background?.service_worker) {
    manifest.background = {
      scripts: [manifest.background.service_worker],
    };
  }

  // Add Firefox-specific settings
  manifest.browser_specific_settings = {
    gecko: {
      id: 'multipoint-gradient@example.com',
      strict_min_version: '109.0',
    },
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Firefox build written to dist-firefox/');
}

if (!firefoxOnly) {
  console.log('Chrome build already in dist/');
}

buildFirefox();
console.log('Build complete.');
