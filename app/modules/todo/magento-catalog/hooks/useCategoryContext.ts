// @env: mixed
import React from 'react';
import { useRenderedLocation } from '@renia/framework/router/renderedLocation';

type Options = {
  meta?: Record<string, unknown>;
};

export const useCategoryContext = ({ meta }: Options) => {
  const location = useRenderedLocation();

  const category = React.useMemo(() => (meta as any)?.category, [meta]);

  // Prefer the rendered location (AppRoot), with a fallback to routeMeta.__ssrPath for SSR/debug payloads.
  const locationPath = React.useMemo(() => {
    const ssrPath = typeof (meta as any)?.__ssrPath === 'string' ? String((meta as any).__ssrPath) : null;
    const pathname = ssrPath ?? location?.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
    const trimmed = pathname.replace(/^\/+|\/+$/g, '');
    return trimmed || undefined;
  }, [location?.pathname, (meta as any)?.__ssrPath]);

  const metaPath = React.useMemo(() => {
    if (typeof category?.urlPath === 'string') return category.urlPath;
    if (typeof category?.url === 'string') return category.url.replace(/^\/+/, '');
    return undefined;
  }, [category]);

  const isMetaInSync = React.useMemo(() => {
    if (!metaPath) return false;
    if (!locationPath) return true;
    return metaPath === locationPath;
  }, [metaPath, locationPath]);

  // Prefer URL-derived path when meta is stale (common during client navigation while /api/page-context is inflight).
  const path = React.useMemo(() => {
    if (metaPath && isMetaInSync) return metaPath;
    return locationPath ?? metaPath;
  }, [isMetaInSync, locationPath, metaPath]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!metaPath || !locationPath) return;
    if (metaPath === locationPath) return;
    console.warn('[useCategoryContext] meta.category is out of sync with current URL; ignoring meta for UID resolution', {
      metaPath,
      locationPath
    });
  }, [locationPath, metaPath]);

  const uidFromMeta = React.useMemo(() => {
    if (!isMetaInSync) return undefined;
    return typeof category?.id === 'string' ? category.id : undefined;
  }, [category, isMetaInSync]);

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

      // UID should arrive via /api/page-context (Magento urlResolver route handler).
      // Keep status as loading until meta catches up to the current URL.
      setUid(undefined);
      setUidStatus('loading');
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
