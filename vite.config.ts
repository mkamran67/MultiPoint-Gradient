import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, renameSync, rmSync } from 'fs';
import { build } from 'vite';

const __dirname = import.meta.dirname;

// Shared resolve config
const sharedResolve = {
  alias: {
    '@shared': resolve(__dirname, 'src/shared'),
  },
};

export default defineConfig({
  root: resolve(__dirname, 'src'),
  plugins: [
    preact(),
    {
      name: 'build-extension-scripts',
      async closeBundle() {
        const dist = resolve(__dirname, 'dist');

        // Build service worker as IIFE (no imports)
        await build({
          configFile: false,
          resolve: sharedResolve,
          build: {
            outDir: dist,
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/background/service-worker.ts'),
              formats: ['iife'],
              name: 'ServiceWorker',
              fileName: () => 'background/service-worker.js',
            },
            rollupOptions: {
              output: { extend: true },
            },
          },
        });

        // Build content script as IIFE (no imports)
        await build({
          configFile: false,
          resolve: sharedResolve,
          build: {
            outDir: dist,
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/content/picker.ts'),
              formats: ['iife'],
              name: 'Picker',
              fileName: () => 'content/picker.js',
            },
            rollupOptions: {
              output: { extend: true },
            },
          },
        });

        // Copy manifest
        copyFileSync(
          resolve(__dirname, 'src/manifest.json'),
          resolve(dist, 'manifest.json')
        );

        // Copy icons
        const iconsDir = resolve(dist, 'assets/icons');
        mkdirSync(iconsDir, { recursive: true });
        for (const size of [16, 32, 48, 128]) {
          const src = resolve(__dirname, `src/assets/icons/icon-${size}.png`);
          if (existsSync(src)) {
            copyFileSync(src, resolve(iconsDir, `icon-${size}.png`));
          }
        }
      },
    },
  ],
  resolve: sharedResolve,
  base: '',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: 'popup/[name].js',
        chunkFileNames: 'popup/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'popup/[name][extname]';
          return 'assets/[name][extname]';
        },
      },
    },
  },
});
