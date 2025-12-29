// @env: server
import fs from 'node:fs';

export type ClientAssetsOptions = {
  staticDir: string;
  clientEntry: string;
  clientOutFile: string;
  assetVersionFile: string;
};

export const createClientAssets = (options: ClientAssetsOptions) => {
  let clientBundleReady = false;
  let cachedAssetVersion: { value: string | null; mtimeMs: number } | null = null;

  const ensureClientBundle = async () => {
    if (clientBundleReady) return;
    if (fs.existsSync(options.clientOutFile)) {
      clientBundleReady = true;
      return;
    }
    if (process.env.NODE_ENV === 'production') return;

    try {
      await fs.promises.mkdir(options.staticDir, { recursive: true });
      const esbuild = await import('esbuild');
      await esbuild.build({
        entryPoints: [options.clientEntry],
        bundle: true,
        sourcemap: true,
        format: 'esm',
        outfile: options.clientOutFile,
        loader: { '.tsx': 'tsx', '.ts': 'ts' },
        plugins: []
      });
      clientBundleReady = true;
    } catch (err) {
      console.error('Nie udało się zbudować paczki klienta (auto):', err);
    }
  };

  const readAssetVersion = () => {
    try {
      const stats = fs.statSync(options.assetVersionFile);
      const version =
        cachedAssetVersion && cachedAssetVersion.mtimeMs === stats.mtimeMs
          ? cachedAssetVersion.value
          : fs.readFileSync(options.assetVersionFile, 'utf8').trim() || null;
      cachedAssetVersion = { value: version, mtimeMs: stats.mtimeMs };
      return version;
    } catch {
      cachedAssetVersion = null;
      return null;
    }
  };

  const resolveClientAssetPath = () => {
    const version = readAssetVersion();
    if (version) {
      return `/static/index.js?v=${encodeURIComponent(version)}`;
    }
    if (process.env.NODE_ENV !== 'production') {
      return `/static/index.js?v=${Date.now()}`;
    }
    return '/static/index.js';
  };

  return { ensureClientBundle, resolveClientAssetPath };
};

export default {
  createClientAssets
};

