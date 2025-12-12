// @env: mixed
import { useLocation } from 'react-router-dom';
import React from 'react';

type Options = {
  categoryUrlPath?: string;
  meta?: Record<string, unknown>;
};

export const useCategoryContext = ({ categoryUrlPath, meta }: Options) => {
  const location = useLocation();

  const category = React.useMemo(() => (meta as any)?.category, [meta]);

  const path = React.useMemo(() => {
    if (categoryUrlPath) return categoryUrlPath;

    const fromMetaPath =
      typeof meta?.categoryUrlPath === 'string' ? String(meta.categoryUrlPath) : undefined;
    if (fromMetaPath) return fromMetaPath;

    const candidate =
      typeof category?.urlPath === 'string'
        ? category.urlPath
        : typeof category?.url === 'string'
          ? category.url.replace(/^\/+/, '').replace(/^category\//, '')
          : undefined;
    if (candidate) return candidate;

    const pathname =
      location?.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
    const trimmed = pathname.replace(/^\/+|\/+$/g, '');
    if (trimmed.startsWith('category/')) {
      return trimmed.replace(/^category\//, '');
    }
    return undefined;
  }, [category, categoryUrlPath, location?.pathname, meta]);

  const uid = React.useMemo(
    () => (typeof category?.id === 'string' ? category.id : undefined),
    [category]
  );

  return {
    path,
    uid,
    category
  };
};

export default useCategoryContext;
