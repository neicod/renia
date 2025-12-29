import { jsx as _jsx } from "react/jsx-runtime";
// @env: mixed
import React from 'react';
import { Link, useResolvedPath } from 'react-router-dom';
import { dedupeSearch } from './paths';
import { getClientInstanceId, prefetchPageContext } from '@renia/framework/runtime/pageContextClient';
export const PrefetchLink = ({ prefetch = false, onMouseEnter, onFocus, to, ...rest }) => {
    const resolved = useResolvedPath(to);
    const handlePrefetch = React.useCallback(() => {
        if (!prefetch)
            return;
        if (typeof window === 'undefined')
            return;
        const clientInstance = getClientInstanceId();
        const targetUrl = `${resolved.pathname}${dedupeSearch(resolved.search)}`;
        prefetchPageContext(targetUrl, { navSeq: 0, clientInstance });
    }, [prefetch, resolved.pathname, resolved.search]);
    return (_jsx(Link, { ...rest, to: to, onMouseEnter: (e) => {
            onMouseEnter?.(e);
            handlePrefetch();
        }, onFocus: (e) => {
            onFocus?.(e);
            handlePrefetch();
        } }));
};
export default PrefetchLink;
