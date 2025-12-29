import esbuild from 'esbuild';
import { localModulesPlugin } from './local-modules-plugin.mjs';

const isWatch = process.argv.includes('--watch');
const isProd = !isWatch && process.env.NODE_ENV === 'production';

const buildOptions = {
    entryPoints: ['app/entry/server/index.tsx'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: 'dist/server/index.js',
    sourcemap: true,
    minify: isProd,
    plugins: [localModulesPlugin()],
    logLevel: 'info'
  };

if (isWatch) {
  buildOptions.watch = {
    onRebuild(error) {
      if (error) {
        console.error('Błąd przebudowy serwera', error);
      } else {
        console.log('Przebudowano serwer');
      }
    }
  };
}

esbuild
  .build(buildOptions)
  .then(() => {
    if (isWatch) {
      console.log('Watch serwera uruchomiony (dist/server/index.js)');
    }
  })
  .catch(() => process.exit(1));
