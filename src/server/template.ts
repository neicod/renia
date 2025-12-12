// @env: server
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
  const styles = `
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --muted: #6b7280;
      --accent: #2563eb;
      --accent-2: #0ea5e9;
      --radius: 12px;
      --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: var(--text);
      background: var(--bg);
      padding: 0 1.5rem 2rem;
    }
    a { color: var(--text); text-decoration: none; }
    a:hover { color: var(--accent); }
    .app-shell { max-width: 1180px; margin: 0 auto; }
    .header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow);
      border-radius: 0 0 var(--radius) var(--radius);
      margin-bottom: 1.25rem;
    }
    .header__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.85rem 1rem;
    }
    .header__menu {
      display: flex;
      justify-content: center;
      padding: 0.35rem 1rem 0.65rem;
      border-top: 1px solid var(--border);
      background: linear-gradient(180deg, rgba(37,99,235,0.04) 0%, rgba(14,165,233,0.06) 100%);
    }
    .nav { display: flex; align-items: center; gap: 0.9rem; font-weight: 600; }
    .nav a { padding: 0.35rem 0.55rem; border-radius: 8px; }
    .nav a:hover { background: rgba(37, 99, 235, 0.08); color: var(--accent); }
    .slot-stack { display: flex; align-items: center; gap: 0.75rem; }
    .main { padding: 0 0 1.5rem; }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.25rem 1.5rem;
      margin-bottom: 1rem;
    }
    .footer {
      margin-top: 1.5rem;
      padding: 1rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.95rem;
    }
    .menu-bar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      background: rgba(37, 99, 235, 0.08);
      color: var(--accent);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .main-menu {
      display: flex;
      gap: 1rem;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      position: relative;
    }
    .main-menu__item {
      position: relative;
      display: inline-block;
    }
    .main-menu__link {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 0.8rem;
      font-weight: 700;
      color: var(--text);
      border-radius: 10px;
      transition: all 140ms ease;
      white-space: nowrap;
    }
    .main-menu__link:hover {
      background: rgba(37, 99, 235, 0.12);
      color: var(--accent);
    }
    .main-menu__dropdown {
      display: none;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      top: calc(100% - 2px);
      left: 0;
      min-width: 220px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
      padding: 0.4rem 0.5rem;
      list-style: none;
      margin: 0;
      z-index: 20;
      transition: opacity 140ms ease;
    }
    .main-menu__item:hover > .main-menu__dropdown,
    .main-menu__item:focus-within > .main-menu__dropdown,
    .main-menu__item .main-menu__dropdown:hover,
    .main-menu__dropdown-item:hover > .main-menu__dropdown,
    .main-menu__dropdown-item:focus-within > .main-menu__dropdown,
    .main-menu__dropdown-item .main-menu__dropdown:hover {
      display: block;
      opacity: 1;
      pointer-events: auto;
    }
    .main-menu__dropdown-item {
      position: relative;
    }
    .main-menu__dropdown-link {
      display: block;
      padding: 0.45rem 0.55rem;
      border-radius: 8px;
      color: var(--text);
      font-weight: 600;
      transition: background 120ms ease, color 120ms ease;
    }
    .main-menu__dropdown-link:hover {
      background: rgba(37, 99, 235, 0.08);
      color: var(--accent);
    }
    .main-menu__dropdown .main-menu__dropdown {
      top: 0;
      left: 100%;
      margin-left: 8px;
    }
  `;

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
    <style>${styles}</style>
  </head>
  <body style="margin:0; padding: 0 1.5rem;">
    <div id="root">${appHtml}</div>
    ${serialized}
    <script type="module" src="${assetPath}"></script>
  </body>
</html>`;
};
