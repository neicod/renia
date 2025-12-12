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

  React.useEffect(() => {
    defaultPageSizeRef.current = defaultPageSize;
  }, [defaultPageSize]);

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
    const parsed = extractCatalogStorefrontConfig(store);
    if (parsed) {
      applyConfig(parsed);
    }
  }, [store, applyConfig]);

  React.useEffect(() => {
    if (extractCatalogStorefrontConfig(store)) return;

    let cancelled = false;

    const loadStorefrontConfig = async () => {
      try {
        const fetched = await getCatalogStorefrontConfig({ store });
        if (cancelled) return;
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
  }, [runtime, store, applyConfig]);

  React.useEffect(() => {
    if (!userSelectedRef.current) {
      setPageSize(defaultPageSize);
    }
  }, [defaultPageSize]);

  React.useEffect(() => {
    userSelectedRef.current = false;
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
