import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

const firefoxOnly = process.argv.includes('--firefox-only');
const shouldZip = process.argv.includes('--zip');

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

function zipBuilds() {
  const manifest = JSON.parse(readFileSync(resolve(dist, 'manifest.json'), 'utf-8'));
  const version = manifest.version;
  const outDir = resolve(root, 'web-ext');
  mkdirSync(outDir, { recursive: true });

  const chromeZip = resolve(outDir, `multipoint-gradient-${version}-chrome.zip`);
  const firefoxZip = resolve(outDir, `multipoint-gradient-${version}-firefox.zip`);

  // Remove old zips if they exist
  if (existsSync(chromeZip)) rmSync(chromeZip);
  if (existsSync(firefoxZip)) rmSync(firefoxZip);

  execSync(`cd "${dist}" && zip -r "${chromeZip}" .`);
  console.log(`Chrome zip: ${chromeZip}`);

  const firefoxDist = resolve(root, 'dist-firefox');
  execSync(`cd "${firefoxDist}" && zip -r "${firefoxZip}" .`);
  console.log(`Firefox zip: ${firefoxZip}`);
}

if (!firefoxOnly) {
  console.log('Chrome build already in dist/');
}

buildFirefox();

if (shouldZip) {
  zipBuilds();
}

console.log('Build complete.');
