// @env: server
// Główne entry serwera SSR: Express + render AppRoot z tras/layoutów/interceptorów.
// Musi pozostać tu jako punkt startu; nie przenoś/nie usuwaj, inaczej SSR/serwowanie statyków przestanie działać.
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createClientAssets } from './assets/clientAssets';
import { loadServerRegistrations } from './runtime/loadModuleServer';
import { registerPageContextRoute } from './routes/pageContext';
import { registerSsrRoute } from './ssr/ssrHandler';
const app = express();
const staticDir = path.resolve(process.cwd(), 'dist/public');
const clientEntry = path.resolve(process.cwd(), 'app/entry/client.tsx');
const clientOutFile = path.join(staticDir, 'index.js');
const assetVersionFile = path.join(staticDir, '.asset-version');

const clientAssets = createClientAssets({ staticDir, clientEntry, clientOutFile, assetVersionFile });
await clientAssets.ensureClientBundle();

app.use('/static', express.static(staticDir, { index: false }));
app.use(express.json({ limit: '1mb' }));

app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(staticDir, 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    return res.sendFile(faviconPath);
  }
  res.status(204).end();
});

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

await loadServerRegistrations(app, {
  configPath: path.resolve(process.cwd(), 'app/etc/config.json'),
  includeNodeModules: false
});

registerPageContextRoute(app);
registerSsrRoute(app, { resolveClientAssetPath: clientAssets.resolveClientAssetPath });

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  // intentionally silent in dev to reduce log noise
});
