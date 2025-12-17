// @env: mixed
import React from 'react';
import { useAppEnvironment } from '@framework/runtime/AppEnvContext';
import {
  getCatalogStorefrontConfig,
  extractCatalogStorefrontConfig,
  DEFAULT_PAGE_SIZE as DEFAULT_PAGE_SIZE_CFG,
  type CatalogStorefrontConfig
} from '../services/storefrontConfig';

export const DEFAULT_PAGE_SIZE = DEFAULT_PAGE_SIZE_CFG;

const normalizePageSize = (value: number) => {
  if (!Number.isFinite(value)) return DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.floor(value));
};

type UseStorefrontPageSizeArgs = {
  resetKey?: string;
};

export const useStorefrontPageSize = ({ resetKey }: UseStorefrontPageSizeArgs = {}) => {
  const { runtime, store } = useAppEnvironment();
  const [pageSize, setPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const [pageSizeOptions, setPageSizeOptions] = React.useState<number[]>([DEFAULT_PAGE_SIZE]);
  const [defaultPageSize, setDefaultPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const userSelectedRef = React.useRef(false);
  const defaultPageSizeRef = React.useRef(defaultPageSize);
  const ssrConfigAppliedRef = React.useRef(false);
  const prevResetKeyRef = React.useRef<string | undefined>(resetKey);


  React.useEffect(() => {
    defaultPageSizeRef.current = defaultPageSize;
  }, [defaultPageSize]);

  // applyConfig doesn't need dependencies - only uses refs and setters
  const applyConfig = React.useCallback((config?: CatalogStorefrontConfig | null) => {
    if (!config) return;
    const allowedOptions =
      config.gridPerPageValues?.length
        ? config.gridPerPageValues
        : [config.gridPerPage ?? DEFAULT_PAGE_SIZE];

    const fallbackDefault = config.gridPerPage ?? allowedOptions[0] ?? DEFAULT_PAGE_SIZE;

    setPageSizeOptions(allowedOptions);
    setDefaultPageSize(fallbackDefault);
    if (!userSelectedRef.current) {
      setPageSize(fallbackDefault);
    }
  }, []);

  React.useEffect(() => {
    // Only apply SSR config once to prevent React.StrictMode double-effect duplication
    if (ssrConfigAppliedRef.current) {
      return;
    }

    const parsed = extractCatalogStorefrontConfig(store);
    if (parsed) {
      ssrConfigAppliedRef.current = true;
      applyConfig(parsed);
    }
  }, [applyConfig]);

  // Only load storefront config once - not on every render
  const configLoadedRef = React.useRef(false);

  React.useEffect(() => {
    if (configLoadedRef.current || extractCatalogStorefrontConfig(store)) return;

    let cancelled = false;

    const loadStorefrontConfig = async () => {
      try {
        const fetched = await getCatalogStorefrontConfig({ store });
        if (cancelled) return;
        configLoadedRef.current = true;
        applyConfig(fetched);
      } catch (error) {
        console.error('[useStorefrontPageSize] Failed to load storefront config', { runtime, error });
        if (cancelled) return;

        setPageSizeOptions((prev) => (prev.length ? prev : [DEFAULT_PAGE_SIZE]));
        setDefaultPageSize((prev) => prev ?? DEFAULT_PAGE_SIZE);
        if (!userSelectedRef.current) {
          setPageSize((prev) => prev || DEFAULT_PAGE_SIZE);
        }
      }
    };

    loadStorefrontConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!userSelectedRef.current) {
      setPageSize(defaultPageSize);
    }
  }, [defaultPageSize]);

  // Reset hook state when resetKey CHANGES (not on initial mount)
  // Only reset if resetKey actually changed from previous value
  React.useEffect(() => {
    // Skip on initial mount
    if (prevResetKeyRef.current === undefined && resetKey !== undefined) {
      prevResetKeyRef.current = resetKey;
      return;
    }

    // Only reset if resetKey actually changed
    if (prevResetKeyRef.current === resetKey) {
      return;
    }

    prevResetKeyRef.current = resetKey;
    userSelectedRef.current = false;
    ssrConfigAppliedRef.current = false;  // Allow SSR config to be reapplied on reset
    setPageSize(defaultPageSizeRef.current);
  }, [resetKey]);

  const setUserPageSize = React.useCallback((value: number) => {
    const normalized = normalizePageSize(value);
    userSelectedRef.current = true;
    setPageSize(normalized);
    return normalized;
  }, []);

  return {
    pageSize,
    pageSizeOptions,
    setUserPageSize
  };
};

export default useStorefrontPageSize;
