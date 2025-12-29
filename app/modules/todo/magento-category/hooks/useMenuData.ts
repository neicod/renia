// @env: mixed
import { useState, useEffect, useRef, useMemo } from 'react';
import type { MenuItem } from 'renia-menu';
import { fetchMenu } from '../services/menu';
import type { IConfigService } from '../services/configService';

export type MenuDataStatus = 'idle' | 'loading' | 'ready' | 'error' | 'empty';

export type UseMenuDataOptions = {
  configService: IConfigService;
};

export type UseMenuDataReturn = {
  items: MenuItem[];
  status: MenuDataStatus;
};

/**
 * Hook do zarządzania stanem i fetchowaniem menu kategorii.
 * Odpowiedzialny za: preloaded data, lazy fetching, error handling.
 *
 * Implementuje SOLID: SRP (single responsibility - data fetching)
 *                     DIP (dependency injection of configService)
 *
 * @param options - Konfiguracja (dependency injection)
 * @returns { items, status }
 */
export const useMenuData = (options: UseMenuDataOptions): UseMenuDataReturn => {
  const { configService } = options;

  const preloaded = useMemo(() => configService.getPreloadedMenu(), [configService]);
  const [items, setItems] = useState<MenuItem[]>(() => preloaded ?? []);
  const [status, setStatus] = useState<MenuDataStatus>(
    preloaded && preloaded.length ? 'ready' : 'idle'
  );

  const endpoint = useMemo(() => configService.getGraphQLEndpoint(), [configService]);
  const rootCategoryId = useMemo(() => configService.getRootCategoryId(), [configService]);
  const preloadedMemo = useMemo(() => preloaded, [preloaded]);
  const fetchingRef = useRef(false);

  // Effect 1: Handle preloaded data
  useEffect(() => {
    if (preloadedMemo && preloadedMemo.length) {
      setItems(preloadedMemo);
      setStatus('ready');
    }
  }, [preloadedMemo]);

  // Effect 2: Fetch if no preloaded data
  useEffect(() => {
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
        console.error('[useMenuData] Błąd pobierania menu kategorii', err);
        if (!cancelled) setStatus('error');
      } finally {
        fetchingRef.current = false;
      }
    };

    run();

    return () => {
      cancelled = true;
      fetchingRef.current = false;
    };
  }, [endpoint, rootCategoryId, preloadedMemo]);

  return { items, status };
};

export default useMenuData;
