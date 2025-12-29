// @env: server
import { serializeBootstrapScript } from './template/bootstrap';
import { escapeHtmlAttr, escapeHtmlText } from './template/escape';
import { DEFAULT_INLINE_STYLES } from './template/styles';

type TemplateOptions = {
  appHtml: string;
  title?: string;
  description?: string;
  assetPath?: string;
  bootstrap?: unknown;
  lang?: string;
  styles?: string;
};

export const htmlTemplate = ({
  appHtml,
  title = 'React SSR app',
  description = 'Starter aplikacji React renderowanej po stronie serwera.',
  assetPath = '/static/index.js',
  bootstrap,
  lang = 'pl',
  styles = DEFAULT_INLINE_STYLES
}: TemplateOptions): string => {
  const safeLang = escapeHtmlAttr(lang);
  const safeTitle = escapeHtmlText(title);
  const safeDescription = escapeHtmlAttr(description);
  const safeAssetPath = escapeHtmlAttr(assetPath);

  const serialized = serializeBootstrapScript(bootstrap);

  return `<!DOCTYPE html>
<html lang="${safeLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${safeDescription}" />
    <title>${safeTitle}</title>
    <style>${styles}</style>
  </head>
  <body style="margin:0; padding: 0 1.5rem;">
    <div id="root">${appHtml}</div>
    ${serialized}
    <script type="module" src="${safeAssetPath}"></script>
  </body>
</html>`;
};
