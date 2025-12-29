// @env: server
import type { Application, Request, Response } from 'express';

// This route is Magento-specific on purpose (integration module boundary).
// Core (app/modules/renia/framework/) should not embed Magento knowledge.
export default function registerServer(app: Application) {
  app.post('/api/magento/graphql', async (req: Request, res: Response) => {
    const upstream = process.env.MAGENTO_GRAPHQL_ENDPOINT;
    if (!upstream) {
      return res.status(500).json({ error: 'Brak MAGENTO_GRAPHQL_ENDPOINT' });
    }

    try {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        ...(req.headers['authorization'] ? { authorization: String(req.headers['authorization']) } : {})
      };

      if (process.env.MAGENTO_STORE_CODE) {
        headers['store'] = process.env.MAGENTO_STORE_CODE;
      }
      if (process.env.MAGENTO_HOST_HEADER) {
        headers['host'] = process.env.MAGENTO_HOST_HEADER;
      }

      const upstreamResp = await fetch(upstream, {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body ?? {})
      });

      const text = await upstreamResp.text();
      res
        .status(upstreamResp.status)
        .set('content-type', upstreamResp.headers.get('content-type') ?? 'application/json')
        .send(text);
    } catch (error) {
      console.error('[MagentoGraphqlProxy] Błąd proxy GraphQL:', error);
      res.status(502).json({ error: 'Proxy GraphQL nieosiągalne', details: String(error) });
    }
  });
}
