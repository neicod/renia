// @env: mixed

import React from 'react';
import { Link, useResolvedPath, type LinkProps } from 'react-router-dom';
import { dedupeSearch } from './paths';
import { getClientInstanceId, prefetchPageContext } from '@renia/framework/runtime/pageContextClient';

export type PrefetchLinkProps = LinkProps & {
  prefetch?: boolean;
};

export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  prefetch = false,
  onMouseEnter,
  onFocus,
  to,
  ...rest
}) => {
  const resolved = useResolvedPath(to);

  const handlePrefetch = React.useCallback(() => {
    if (!prefetch) return;
    if (typeof window === 'undefined') return;

    const clientInstance = getClientInstanceId();
    const targetUrl = `${resolved.pathname}${dedupeSearch(resolved.search)}`;
    prefetchPageContext(targetUrl, { navSeq: 0, clientInstance });
  }, [prefetch, resolved.pathname, resolved.search]);

  return (
    <Link
      {...rest}
      to={to}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        handlePrefetch();
      }}
      onFocus={(e) => {
        onFocus?.(e);
        handlePrefetch();
      }}
    />
  );
};

export default PrefetchLink;
