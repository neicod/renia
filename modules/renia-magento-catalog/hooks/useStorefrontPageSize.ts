// @env: mixed
import React from 'react';
import { fetchStorefrontPageSizeConfig } from '../services/storefrontConfig';

export const DEFAULT_PAGE_SIZE = 12;

const normalizePageSize = (value: number) => {
  if (!Number.isFinite(value)) return DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.floor(value));
};

type UseStorefrontPageSizeArgs = {
  env: 'ssr' | 'client';
  resetKey?: string;
};

export const useStorefrontPageSize = ({ env, resetKey }: UseStorefrontPageSizeArgs) => {
  const [pageSize, setPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const [pageSizeOptions, setPageSizeOptions] = React.useState<number[]>([DEFAULT_PAGE_SIZE]);
  const [defaultPageSize, setDefaultPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const userSelectedRef = React.useRef(false);
  const defaultPageSizeRef = React.useRef(defaultPageSize);

  React.useEffect(() => {
    defaultPageSizeRef.current = defaultPageSize;
  }, [defaultPageSize]);

  React.useEffect(() => {
    let cancelled = false;

    const loadStorefrontConfig = async () => {
      try {
        const config = await fetchStorefrontPageSizeConfig();
        if (cancelled) return;

        const allowedOptions =
          config.gridPerPageValues.length > 0
            ? config.gridPerPageValues
            : config.defaultGridPerPage
              ? [config.defaultGridPerPage]
              : [DEFAULT_PAGE_SIZE];

        const fallbackDefault =
          config.defaultGridPerPage ?? allowedOptions[0] ?? DEFAULT_PAGE_SIZE;

        setPageSizeOptions(allowedOptions);
        setDefaultPageSize(fallbackDefault);
        if (!userSelectedRef.current) {
          setPageSize(fallbackDefault);
        }
      } catch (error) {
        console.error('[useStorefrontPageSize] Failed to load store config', { env, error });
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
  }, [env]);

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
