import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const modulesDir = path.join(rootDir, 'app', 'modules', 'renia');
const outputDir = path.join(rootDir, 'packages');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};


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
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
};

const run = (command, cwd, options = {}) => {
  return execSync(command, { cwd, stdio: 'inherit', ...options });
};

const packModule = (dir, failures, logs) => {
  const pkg = readPackageJson(dir);
  const name = pkg?.name || path.basename(dir);

  console.log(`\n[pack] ${name}`);
  if (pkg?.scripts?.build) {
    try {
      run('npm run build', dir);
    } catch (error) {
      failures.push({ name, step: 'build', error });
      logs.push({
        name,
        step: 'build',
        message: error instanceof Error ? error.message : String(error)
      });
      console.log(`[pack] ${name}: build failed, pomijam pack`);
      return;
    }
  } else {
    console.log(`[pack] ${name}: brak skryptu build, pomijam build`);
  }
  try {
    run(`npm pack --pack-destination ${outputDir}`, dir);
  } catch (error) {
    failures.push({ name, step: 'pack', error });
    logs.push({
      name,
      step: 'pack',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

ensureDir(outputDir);

const moduleDirs = listModuleDirs().sort((a, b) => {
  const nameA = readPackageJson(a)?.name ?? '';
  const nameB = readPackageJson(b)?.name ?? '';
  if (nameA === '@renia/framework') return -1;
  if (nameB === '@renia/framework') return 1;
  if (nameA === 'renia-graphql-client') return -1;
  if (nameB === 'renia-graphql-client') return 1;
  return nameA.localeCompare(nameB);
});
if (!moduleDirs.length) {
  console.log('Brak modułów do spakowania.');
  process.exit(0);
}

const failures = [];
const logs = [];

for (const dir of moduleDirs) {
  packModule(dir, failures, logs);
}

if (failures.length) {
  const logPath = path.join(outputDir, 'build-errors.log');
  const lines = failures.map((f) => `- ${f.name} (${f.step})`).join('\n');
  const details = logs
    .map((entry) => {
      return [
        `\n[${entry.name}] ${entry.step}`,
        entry.message
      ].join('\n');
    })
    .join('\n');
  fs.writeFileSync(logPath, lines + '\n' + details + '\n', 'utf8');
  console.log(`\nGotowe z błędami. Szczegóły w: ${logPath}`);
  process.exitCode = 1;
} else {
  console.log(`\nGotowe. Paczki w: ${outputDir}`);
}
