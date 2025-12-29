// @env: server
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Application } from 'express';
import { loadModuleRegistry, type RegistryOptions } from '@renia/framework/registry/moduleRegistry';

const candidates = [
  'registerServer.ts',
  'registerServer.tsx',
  'registerServer.js',
  'registerServer.mjs',
  'registerServer.cjs'
];

const loaded = new Set<string>();

export type ServerRegistrationContext = {
  moduleName: string;
  modulePath: string;
  configPath?: string;
};

export type ServerRegistration = (app: Application, ctx: ServerRegistrationContext) => void | Promise<void>;

export const loadServerRegistrations = async (
  app: Application,
  options: Pick<RegistryOptions, 'configPath' | 'includeNodeModules' | 'statusMap'> = {}
): Promise<void> => {
  const modules = await loadModuleRegistry({
    configPath: options.configPath,
    includeNodeModules: options.includeNodeModules,
    statusMap: options.statusMap
  });

  for (const mod of modules) {
    if (!mod.enabled) continue;
    if (loaded.has(mod.name)) continue;

    let regFile: string | undefined;
    for (const candidate of candidates) {
      const candidatePath = path.join(mod.path, candidate);
      if (fs.existsSync(candidatePath)) {
        regFile = candidatePath;
        break;
      }
    }
    if (!regFile) continue;

    try {
      const imported = await import(pathToFileURL(regFile).href);
      const fn = (imported?.default ?? imported?.registerServer) as unknown;
      if (typeof fn === 'function') {
        await (fn as ServerRegistration)(app, { moduleName: mod.name, modulePath: mod.path, configPath: options.configPath });
        loaded.add(mod.name);
      } else {
        console.warn(`[ServerRegistrations] ${mod.name}: ${regFile} does not export a function (default or registerServer)`);
      }
    } catch (error) {
      console.error(`Nie udało się załadować rejestru serwera dla modułu "${mod.name}" (${regFile}):`, error);
    }
  }
};

export default {
  loadServerRegistrations
};

