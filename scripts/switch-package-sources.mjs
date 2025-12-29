import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2];
if (!['pack', 'local'].includes(mode)) {
  console.error('Usage: node scripts/switch-package-sources.mjs <pack|local>');
  process.exit(1);
}

const rootDir = process.cwd();
const modulesDir = path.join(rootDir, 'app', 'modules', 'renia');
const packagesDir = path.join(rootDir, 'packages');
const pkgPath = path.join(rootDir, 'package.json');

const listModuleDirs = () => {
  if (!fs.existsSync(modulesDir)) return [];
  return fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(modulesDir, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, 'package.json')));
};

const readPackageJson = (dir) => {
  const file = path.join(dir, 'package.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const tarballNameFor = (name, version) => {
  const baseName = name.startsWith('@') ? name.slice(1).replace('/', '-') : name;
  return `${baseName}-${version}.tgz`;
};

const moduleDirs = listModuleDirs();
const moduleMap = new Map();
for (const dir of moduleDirs) {
  const pkg = readPackageJson(dir);
  if (!pkg?.name || !pkg?.version) continue;
  const tarballName = tarballNameFor(pkg.name, pkg.version);
  moduleMap.set(pkg.name, { dir, tarballName });
}

const rootPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const sections = ['dependencies', 'devDependencies', 'optionalDependencies'];

let changed = 0;
const missingTarballs = [];

for (const section of sections) {
  const deps = rootPkg[section];
  if (!deps || typeof deps !== 'object') continue;
  for (const [name, value] of Object.entries(deps)) {
    const info = moduleMap.get(name);
    if (!info) continue;

    if (mode === 'pack') {
      const tarballPath = path.join('packages', info.tarballName);
      const absTarballPath = path.join(packagesDir, info.tarballName);
      if (!fs.existsSync(absTarballPath)) {
        missingTarballs.push(`${name} -> ${tarballPath}`);
        continue;
      }
      const next = `file:${tarballPath}`;
      if (value !== next) {
        deps[name] = next;
        changed += 1;
      }
    } else {
      const localPath = `file:app/modules/renia/${path.basename(info.dir)}`;
      if (value !== localPath) {
        deps[name] = localPath;
        changed += 1;
      }
    }
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(rootPkg, null, 2) + '\n');

if (mode === 'pack' && missingTarballs.length) {
  console.log('Brak paczek dla:');
  for (const entry of missingTarballs) console.log(`- ${entry}`);
}

console.log(`Zaktualizowano ${changed} zależności (${mode}).`);
