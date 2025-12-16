import esbuild from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { localModulesPlugin } from './local-modules-plugin.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const isProd = !isWatch && process.env.NODE_ENV === 'production';
const assetVersionFile = path.resolve('dist/public/.asset-version');

const ensureDir = async (filePath) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

const generateAssetVersion = () =>
  process.env.ASSET_VERSION ?? `${Date.now().toString()}-${Math.random().toString(36).slice(2, 8)}`;

const writeAssetVersion = async () => {
  const version = generateAssetVersion();
  try {
    await ensureDir(assetVersionFile);
    await writeFile(assetVersionFile, version, 'utf8');
    console.log(`[build-client] Zapisano wersję assetów ${version}`);
  } catch (error) {
    console.error('[build-client] Nie udało się zapisać pliku .asset-version', error);
  }
};

esbuild
  .build({
    entryPoints: ['src/client/index.tsx'],
    bundle: true,
    sourcemap: true,
    format: 'esm',
    outdir: 'dist/public',
    loader: { '.tsx': 'tsx' },
    plugins: [localModulesPlugin()],
    splitting: true,
    chunkNames: 'chunks/[name]-[hash]',
    minify: isProd,
    target: ['es2020'],
    ...(isWatch
      ? {
          watch: {
            onRebuild(error) {
              if (error) {
                console.error('Błąd przebudowy klienta', error);
              } else {
                console.log('Przebudowano klienta');
                writeAssetVersion();
              }
            }
          }
        }
      : {}),
    logLevel: 'info'
  })
  .then(async () => {
    await writeAssetVersion();
    if (isWatch) {
      console.log('Watch klienta uruchomiony (dist/public)');

      // Watch config.json for changes and regenerate interceptor map
      const configPath = path.resolve(process.cwd(), 'app/etc/config.json');
      watch(configPath, { persistent: false }, () => {
        console.log('[build-client] config.json changed, regenerating interceptor map...');
        spawn('node', [path.join(__dirname, 'generate-interceptor-map.mjs')], {
          stdio: 'inherit'
        });
      });
    }
  })
  .catch(() => process.exit(1));
