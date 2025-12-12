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
      --bg: #f5f7fb;
      --bg-accent: #e4e9f7;
      --surface: #ffffff;
      --surface-muted: #f1f4fb;
      --border: #e2e8f0;
      --text: #0f172a;
      --muted: #64748b;
      --accent: #4c6ef5;
      --accent-2: #22b8cf;
      --radius: 16px;
      --shadow: 0 15px 35px rgba(15, 23, 42, 0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: var(--text);
      background: linear-gradient(180deg, #fdfdff 0%, #f7f9ff 60%, #eef2ff 100%) fixed;
      padding: 0 1rem 2.5rem;
    }
    a { color: var(--text); text-decoration: none; transition: color 160ms ease; }
    a:hover { color: var(--accent); }
    .app-shell { max-width: 1180px; margin: 0 auto; }
    .header {
      position: sticky;
      top: 0.75rem;
      z-index: 20;
      margin-bottom: 1.5rem;
    }
    .header__inner {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem 1.25rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .header__brand {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .brand-logo {
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: 0.03em;
    }
    .brand-tagline {
      margin: 0;
      font-size: 0.85rem;
      color: var(--muted);
    }
    .nav {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.65rem;
      font-weight: 600;
    }
    .nav a {
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      border: 1px solid transparent;
      transition: all 140ms ease;
      background: var(--surface-muted);
    }
    .nav a:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .slot-stack {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.65rem;
    }
    .slot-stack > *:not(.search-bar) {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      background: var(--surface-muted);
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 0.9rem;
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.45rem 0.35rem 0.85rem;
      border-radius: 999px;
      background: #fff;
      border: 1px solid var(--border);
      box-shadow: inset 0 0 0 1px rgba(76, 110, 245, 0.05);
    }
    .search-input {
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 0.9rem;
      min-width: 170px;
    }
    .search-input:focus {
      outline: none;
    }
    .search-button {
      border: none;
      border-radius: 999px;
      padding: 0.35rem 0.85rem;
      background: linear-gradient(120deg, var(--accent), var(--accent-2));
      color: #fff;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      cursor: pointer;
      transition: opacity 140ms ease;
    }
    .search-button svg {
      width: 16px;
      height: 16px;
    }
    .search-button:hover {
      opacity: 0.9;
    }
    .header__menu {
      margin-top: 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0.85rem 1rem;
      background: var(--surface);
      box-shadow: var(--shadow);
    }
    .main-menu {
      display: flex;
      gap: 0.85rem;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      position: relative;
      flex-wrap: wrap;
    }
    .main-menu__link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.35rem 0.75rem;
      font-weight: 600;
      color: var(--text);
      border-radius: 10px;
      transition: background 140ms ease;
      white-space: nowrap;
    }
    .main-menu__link:hover {
      background: rgba(76, 110, 245, 0.15);
      color: var(--accent);
    }
    .main-menu__dropdown {
      display: none;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 220px;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: var(--shadow);
      padding: 0.5rem;
      list-style: none;
      margin: 0;
      z-index: 30;
    }
    .main-menu__item:hover > .main-menu__dropdown,
    .main-menu__item:focus-within > .main-menu__dropdown,
    .main-menu__dropdown-item:hover > .main-menu__dropdown,
    .main-menu__dropdown-item:focus-within > .main-menu__dropdown {
      display: block;
      opacity: 1;
      pointer-events: auto;
    }
    .main-menu__dropdown-link {
      display: block;
      padding: 0.4rem 0.55rem;
      border-radius: 10px;
      color: var(--text);
      font-weight: 500;
      transition: background 120ms ease, color 120ms ease;
    }
    .main-menu__dropdown-link:hover {
      background: var(--surface-muted);
      color: var(--accent);
    }
    .main-menu__dropdown .main-menu__dropdown {
      top: 0;
      left: 100%;
      margin-left: 10px;
    }
    .main {
      padding: 0 0 2rem;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.4rem 1.6rem;
      margin-bottom: 1.25rem;
    }
    .footer {
      margin-top: 2rem;
      padding: 1.25rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.95rem;
    }
    @media (max-width: 960px) {
      .header__inner {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .slot-stack {
        justify-content: center;
      }
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
