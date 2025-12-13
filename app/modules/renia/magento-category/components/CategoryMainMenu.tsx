// @env: mixed
import React from 'react';
import type { MenuItem } from 'renia-menu';
import { fetchMenu } from '../services/menu';
import { useI18n } from 'renia-i18n/hooks/useI18n';

const readGraphQLEndpoint = (): string | undefined => {
  const globalConfig = (globalThis as any).__APP_CONFIG__;
  if (globalConfig?.magentoProxyEndpoint) return globalConfig.magentoProxyEndpoint;
  if (globalConfig?.magentoGraphQLEndpoint) return globalConfig.magentoGraphQLEndpoint;
  if (typeof window !== 'undefined') {
    const cfg = (window as any).__APP_BOOTSTRAP__?.config ?? {};
    return cfg.magentoProxyEndpoint ?? cfg.magentoGraphQLEndpoint;
  }
  return undefined;
};

const readRootCategoryId = (): string | undefined => {
  const globalConfig = (globalThis as any).__APP_CONFIG__;
  if (globalConfig?.magentoRootCategoryId) return globalConfig.magentoRootCategoryId;
  if (typeof window !== 'undefined') {
    return (window as any).__APP_BOOTSTRAP__?.config?.magentoRootCategoryId;
  }
  return undefined;
};

const readPreloadedMenu = (): MenuItem[] | undefined => {
  const globalConfig = (globalThis as any).__APP_CONFIG__;
  if (globalConfig?.preloadedCategoryMenu) return globalConfig.preloadedCategoryMenu;
  if (typeof window !== 'undefined') {
    return (window as any).__APP_BOOTSTRAP__?.config?.preloadedCategoryMenu;
  }
  return undefined;
};

export const CategoryMainMenu: React.FC = () => {
  const preloaded = React.useMemo(() => readPreloadedMenu(), []);
  const [items, setItems] = React.useState<MenuItem[]>(() => preloaded ?? []);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error' | 'empty'>(
    preloaded && preloaded.length ? 'ready' : 'idle'
  );
  const { t } = useI18n();
  const endpoint = React.useMemo(() => readGraphQLEndpoint(), []);
  const rootCategoryId = React.useMemo(() => readRootCategoryId(), []);
  const preloadedMemo = React.useMemo(() => preloaded, [preloaded]);
  const fetchingRef = React.useRef(false);

  React.useEffect(() => {
    if (preloadedMemo && preloadedMemo.length) {
      setItems(preloadedMemo);
      setStatus('ready');
    }
  }, [preloadedMemo]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!endpoint) return;
      if (preloadedMemo && preloadedMemo.length) return;
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setStatus('loading');
      try {
        const variables = rootCategoryId
          ? { filters: { parent_id: { eq: rootCategoryId } } }
          : undefined;
        const data = await fetchMenu({ variables });
        if (!cancelled) {
          setItems(data);
          setStatus(data.length ? 'ready' : 'empty');
        }
      } catch (err) {
        console.error('Błąd pobierania menu kategorii', err);
        if (!cancelled) setStatus('error');
      }
      fetchingRef.current = false;
    };

    run();
    return () => {
      cancelled = true;
      fetchingRef.current = false;
    };
  }, [endpoint, rootCategoryId, preloadedMemo]);

  const renderTree = (nodes: MenuItem[], depth = 0): React.ReactNode => {
    if (!nodes.length) return null;

    const listProps =
      depth === 0
        ? { className: 'main-menu' }
        : { className: 'main-menu__dropdown', role: 'menu' as const, 'aria-hidden': true };

    return (
      <ul {...listProps}>
        {nodes.map((node) => {
          const hasChildren = Boolean(node.children?.length);
          const itemClass = depth === 0 ? 'main-menu__item' : 'main-menu__dropdown-item';
          const linkClass = depth === 0 ? 'main-menu__link' : 'main-menu__dropdown-link';
          const childMenu =
            hasChildren && renderTree(node.children ?? [], depth + 1);

          return (
            <li key={node.id} className={itemClass}>
              <a className={linkClass} href={node.url}>
                {node.label}
              </a>
              {childMenu}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderState = (message: string, tone: 'muted' | 'error' | 'info' = 'muted') => {
    const colors = {
      muted: '#6b7280',
      error: '#b91c1c',
      info: '#0f172a'
    } as const;
    return (
      <div className="main-menu">
        <span style={{ color: colors[tone], fontSize: '0.95rem' }}>{message}</span>
      </div>
    );
  };

  if (!endpoint) return renderState(t('category.menu.noEndpoint'));
  if (status === 'error') return renderState(t('category.menu.error'), 'error');
  if (status === 'loading' && items.length === 0) return renderState(t('category.menu.loading'), 'info');
  if (status === 'empty') return renderState(t('category.menu.empty'));

  return renderTree(items);
};

export default CategoryMainMenu;
