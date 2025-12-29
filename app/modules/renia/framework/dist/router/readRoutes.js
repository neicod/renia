// @env: server
import fs from 'node:fs';
import path from 'node:path';
const defaultRouteFiles = ['routes.ts', 'routes.js'];
export const pickRoutesFile = (moduleDir, explicit) => {
    if (explicit) {
        const candidate = path.resolve(moduleDir, explicit);
        return fs.existsSync(candidate) ? candidate : null;
    }
    for (const filename of defaultRouteFiles) {
        const candidate = path.resolve(moduleDir, filename);
        if (fs.existsSync(candidate))
            return candidate;
    }
    return null;
};
export const readRoutesFile = async (filePath) => {
    if (!fs.existsSync(filePath))
        return null;
    try {
        if (filePath.endsWith('.json')) {
            const raw = await fs.promises.readFile(filePath, 'utf8');
            return JSON.parse(raw);
        }
        const imported = await import(filePath);
        const data = imported?.default ?? imported;
        if (Array.isArray(data))
            return data;
        if (Array.isArray(data?.routes))
            return data.routes;
    }
    catch (error) {
        console.error(`Nie udało się wczytać tras z ${filePath}:`, error);
    }
    return null;
};
