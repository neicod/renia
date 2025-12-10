type TemplateOptions = {
  appHtml: string;
  title?: string;
  description?: string;
  assetPath?: string;
  bootstrap?: unknown;
};

export const htmlTemplate = ({
  appHtml,
  title = 'React SSR app',
  description = 'Starter aplikacji React renderowanej po stronie serwera.',
  assetPath = '/static/index.js',
  bootstrap
}: TemplateOptions): string => {
  const serialized =
    bootstrap !== undefined
      ? `<script>window.__APP_BOOTSTRAP__=${JSON.stringify(bootstrap).replace(/</g, '\\u003c')};</script>`
      : '';

  return `<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${description}" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding: 0 1.5rem;">
    <div id="root">${appHtml}</div>
    ${serialized}
    <script type="module" src="${assetPath}"></script>
  </body>
</html>`;
};
