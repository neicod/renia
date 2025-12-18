// @env: mixed
import { useLocation } from 'react-router-dom';
import React from 'react';
import { fetchCategoryUid } from '../services/categoryUid';

type Options = {
  meta?: Record<string, unknown>;
};

export const useCategoryContext = ({ meta }: Options) => {
  const location = useLocation();

  const category = React.useMemo(() => (meta as any)?.category, [meta]);

  const path = React.useMemo(() => {
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
  }, [category, location?.pathname]);

  const uidFromMeta = React.useMemo(
    () => (typeof category?.id === 'string' ? category.id : undefined),
    [category]
  );

  const [uid, setUid] = React.useState<string | undefined>(() => uidFromMeta);
  const [uidStatus, setUidStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error'>(() => {
    if (uidFromMeta) return 'ready';
    if (path) return 'loading';
    return 'idle';
  });

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (uidFromMeta) {
        setUid(uidFromMeta);
        setUidStatus('ready');
        return;
      }

      if (!path) {
        setUid(undefined);
        setUidStatus('idle');
        return;
      }

      setUidStatus('loading');
      try {
        const resolved = await fetchCategoryUid({ urlPath: path });
        if (cancelled) return;
        if (resolved) {
          setUid(resolved);
          setUidStatus('ready');
          return;
        }
        setUid(undefined);
        setUidStatus('error');
      } catch (err) {
        console.error('[useCategoryContext] Failed to resolve category uid', { path, err });
        if (cancelled) return;
        setUid(undefined);
        setUidStatus('error');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [path, uidFromMeta]);

  return {
    path,
    uid,
    uidStatus,
    category
  };
};

export default useCategoryContext;
