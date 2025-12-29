import fs from 'node:fs';
import path from 'node:path';
import { builtinModules, createRequire } from 'node:module';

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => (m.startsWith('node:') ? m.slice(5) : `node:${m}`))
]);

export const localModulesPlugin = () => ({
  name: 'local-modules',
  setup(build) {
    const requireFromRoot = createRequire(path.join(process.cwd(), 'package.json'));
    const reniaModulesDir = path.resolve(process.cwd(), 'app/modules/renia');

    const resolveLocalModule = (specifier) => {
      let pkgDir = null;

      // If not found and specifier starts with 'renia-', try removing prefix in app/modules/renia/
      if (specifier.startsWith('renia-')) {
        const moduleName = specifier.slice(6); // Remove 'renia-' prefix
        pkgDir = path.join(reniaModulesDir, moduleName);
      }

      // If still not found and specifier is 'magento-*', try in app/modules/renia/ as-is
      if (!pkgDir && specifier.startsWith('magento-')) {
        pkgDir = path.join(reniaModulesDir, specifier);
      }

      if (!pkgDir || !fs.existsSync(pkgDir) || !fs.statSync(pkgDir).isDirectory()) return null;

      const pkgJsonPath = path.join(pkgDir, 'package.json');
      const candidates = [];

      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
          if (typeof pkg.exports === 'string') candidates.push(pkg.exports);
          if (pkg.main) candidates.push(pkg.main);
          if (pkg.module) candidates.push(pkg.module);
        } catch {
          // ignorujemy błędne package.json
        }
      }

      candidates.push('index.tsx', 'index.ts', 'index.js', 'index.mjs', 'index.cjs');

      for (const candidate of candidates) {
        const basePath = path.resolve(pkgDir, candidate);
        const hasExt = path.extname(basePath) !== '';

        if (fs.existsSync(basePath)) return basePath;

        if (!hasExt) {
          for (const ext of ['.tsx', '.ts', '.js', '.mjs', '.cjs']) {
            const withExt = `${basePath}${ext}`;
            if (fs.existsSync(withExt)) return withExt;
          }
        }
      }

      return null;
    };

    // Match bare specifiers (skip relative/absolute).
    build.onResolve({ filter: /^[^./].*/ }, (args) => {
      if (builtins.has(args.path)) return undefined;

      const localResolved = resolveLocalModule(args.path);
      if (localResolved) return { path: localResolved };

      const paths = [];
      if (args.resolveDir) paths.push(args.resolveDir);
      paths.push(process.cwd());

      try {
        const resolved = requireFromRoot.resolve(args.path, { paths });
        return { path: resolved };
      } catch {
        return undefined;
      }
    });
  }
});
