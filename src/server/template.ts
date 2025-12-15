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
      --bg: #fafafa;
      --bg-gradient-start: #ffffff;
      --bg-gradient-end: #f5f5f5;
      --surface: #ffffff;
      --surface-muted: #f9f9f9;
      --border: #e5e5e5;
      --text: #1a1a1a;
      --muted: #757575;
      --accent: #000000;
      --accent-2: #262626;
      --accent-3: #f5f5f5;
      --radius: 8px;
      --shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      color: var(--text);
      background: var(--bg);
      padding: 0 1rem 3rem;
    }
    a { color: inherit; text-decoration: none; transition: color 160ms ease, opacity 160ms ease; }
    a:hover { color: var(--accent); }
    .app-shell { max-width: 1220px; margin: 0 auto; }
    .header {
      position: sticky;
      top: 0.75rem;
      z-index: 20;
      margin-bottom: 1.25rem;
    }
    .header__inner {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .header__brand {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .brand-logo {
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: 0;
      color: var(--text);
    }
    .brand-tagline {
      margin: 0;
      font-size: 0.8rem;
      color: var(--muted);
      font-weight: 400;
    }
    .slot-stack {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .slot-stack > *:not(.search-bar) {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.95rem;
      border-radius: 4px;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: none;
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.5rem 0.4rem 0.9rem;
      border-radius: 4px;
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: none;
    }
    .search-input {
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 0.95rem;
      min-width: 180px;
    }
    .search-input:focus {
      outline: none;
    }
    .search-button {
      border: none;
      border-radius: 4px;
      padding: 0.45rem 0.95rem;
      background: var(--accent);
      color: #fff;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      box-shadow: none;
    }
    .search-button svg {
      width: 16px;
      height: 16px;
    }
    .header__menu {
      margin-top: 0.95rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0.75rem 1rem;
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
    .main-menu__item {
      position: relative;
      display: inline-flex;
      padding-bottom: 0.75rem;
    }
    .main-menu__item::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 14px;
      background: transparent;
    }
    .main-menu__link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.75rem;
      font-weight: 500;
      color: var(--text);
      border-radius: 4px;
      transition: background 140ms ease, color 140ms ease;
      white-space: nowrap;
      font-size: 0.9rem;
    }
    .main-menu__link:hover {
      background: var(--surface-muted);
      color: var(--text);
    }
    .main-menu__dropdown {
      display: none;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      min-width: 240px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 0.5rem;
      list-style: none;
      margin: 0;
      z-index: 30;
      transition: opacity 120ms ease;
    }
    .main-menu__item:hover > .main-menu__dropdown,
    .main-menu__item:focus-within > .main-menu__dropdown,
    .main-menu__dropdown-item:hover > .main-menu__dropdown,
    .main-menu__dropdown-item:focus-within > .main-menu__dropdown {
      display: block;
      opacity: 1;
      pointer-events: auto;
    }
    .main-menu__dropdown-item {
      position: relative;
      padding-right: 0.4rem;
    }
    .main-menu__dropdown-link {
      display: block;
      padding: 0.4rem 0.6rem;
      border-radius: 4px;
      color: var(--text);
      font-weight: 400;
      font-size: 0.9rem;
      transition: background 120ms ease, color 120ms ease;
    }
    .main-menu__dropdown-link:hover {
      background: var(--surface-muted);
      color: var(--text);
    }
    .main-menu__dropdown .main-menu__dropdown {
      top: -6px;
      left: calc(100% + 12px);
      margin-left: 0;
    }
    .hero-banner {
      margin-top: 1.5rem;
      border-radius: var(--radius);
      padding: 2rem;
      background: #1a1a1a;
      color: #fff;
      box-shadow: var(--shadow);
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      overflow: hidden;
      position: relative;
    }
    .hero-banner::after {
      content: '';
      display: none;
    }
    .hero-banner__content {
      position: relative;
      display: grid;
      gap: 1.25rem;
    }
    .hero-eyebrow {
      margin: 0;
      font-size: 0.9rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.8);
    }
    .hero-title {
      margin: 0;
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 700;
      line-height: 1.2;
    }
    .hero-desc {
      margin: 0;
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.85);
      max-width: 520px;
    }
    .hero-actions {
      display: flex;
      gap: 0.85rem;
      flex-wrap: wrap;
    }
    .hero-stats {
      position: relative;
      display: grid;
      gap: 1rem;
      align-content: start;
      padding: 1.25rem;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .hero-stats__card {
      border-radius: 18px;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      display: grid;
      gap: 0.35rem;
    }
    .hero-stats__value {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .tag-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.18);
      font-size: 0.9rem;
      font-weight: 600;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      border-radius: 4px;
      padding: 0.5rem 1.1rem;
      font-weight: 600;
      font-size: 0.9rem;
      transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
      border: none;
      cursor: pointer;
    }
    .button--primary {
      color: #fff;
      background: #000;
      box-shadow: none;
    }
    .button--ghost {
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.6);
      background: transparent;
    }
    .button:hover {
      opacity: 0.9;
    }
    .main {
      padding: 0 0 2.5rem;
    }
    .section-title {
      margin: 0 0 1.25rem;
      font-size: 1.5rem;
      font-weight: 400;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      letter-spacing: -0.01em;
    }
    .section-title::after {
      content: '';
      display: none;
    }
    .product-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(4, 1fr);
      align-items: stretch;
    }
    .product-grid[data-loading='true'] {
      opacity: 0.5;
      pointer-events: none;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    .footer {
      margin-top: 2.5rem;
      padding: 1.25rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.9rem;
      border-radius: var(--radius);
      border-top: 1px solid var(--border);
    }
    @media (max-width: 1024px) {
      .hero-banner {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      .header__inner {
        grid-template-columns: 1fr;
      }
      .slot-stack {
        justify-content: flex-start;
      }
    }
    @media (max-width: 1024px) {
      .product-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (max-width: 768px) {
      .product-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 640px) {
      .app-shell {
        padding: 0;
      }
      .slot-stack {
        justify-content: center;
      }
      .hero-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .product-grid {
        grid-template-columns: 1fr;
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
