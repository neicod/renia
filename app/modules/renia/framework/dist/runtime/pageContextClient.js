// @env: mixed
import { dedupeSearch } from '@renia/framework/router/paths';
import { getGlobalTtlCache } from './cache/ttlCache';
const PAGE_CONTEXT_CACHE_TTL_MS = 30000;
const PAGE_CONTEXT_CACHE_MAX_ENTRIES = 500;
const pageContextCache = getGlobalTtlCache('pageContext.client', {
    ttlMs: PAGE_CONTEXT_CACHE_TTL_MS,
    maxEntries: PAGE_CONTEXT_CACHE_MAX_ENTRIES
});
const TELEMETRY_STORAGE_KEY = '__renia_page_context_telemetry__';
const MAX_LAST_EVENTS = 30;
const readTelemetryFromSession = () => {
    if (typeof window === 'undefined')
        return null;
    try {
        const raw = window.sessionStorage.getItem(TELEMETRY_STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    }
    catch {
        return null;
    }
};
const defaultTelemetry = () => ({
    callsTotal: 0,
    callsByReason: {},
    callsByPath: {},
    cacheHits: 0,
    cacheMisses: 0,
    networkCalls: 0,
    networkByReason: {},
    last: []
});
let telemetry = defaultTelemetry();
const persistTelemetry = () => {
    if (typeof window === 'undefined')
        return;
    try {
        window.sessionStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(telemetry));
    }
    catch {
        // ignore
    }
};
const ensureTelemetryLoaded = () => {
    if (telemetry.callsTotal !== 0 || telemetry.last.length !== 0)
        return;
    const existing = readTelemetryFromSession();
    if (existing)
        telemetry = existing;
};
const bump = (obj, key) => {
    const k = String(key ?? '');
    if (!k)
        return;
    obj[k] = (obj[k] ?? 0) + 1;
};
const recordEvent = (kind, url, reason) => {
    ensureTelemetryLoaded();
    telemetry.last.unshift({ at: Date.now(), reason: String(reason ?? ''), url: String(url ?? ''), kind });
    telemetry.last = telemetry.last.slice(0, MAX_LAST_EVENTS);
    persistTelemetry();
};
export const getPageContextTelemetry = () => {
    ensureTelemetryLoaded();
    return telemetry;
};
export const resetPageContextTelemetry = () => {
    telemetry = defaultTelemetry();
    if (typeof window !== 'undefined') {
        try {
            window.sessionStorage.removeItem(TELEMETRY_STORAGE_KEY);
        }
        catch {
            // ignore
        }
    }
};
export const getClientInstanceId = () => {
    if (typeof window === 'undefined')
        return null;
    try {
        const key = '__renia_client_instance__';
        const existing = window.sessionStorage.getItem(key);
        if (existing)
            return existing;
        const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        window.sessionStorage.setItem(key, created);
        return created;
    }
    catch {
        return null;
    }
};
export const normalizeTargetUrl = (url) => {
    const raw = String(url ?? '').trim();
    if (!raw)
        return '';
    const withoutHash = raw.split('#')[0] ?? raw;
    try {
        const u = new URL(withoutHash, 'http://local');
        return `${u.pathname || '/'}${dedupeSearch(u.search || '')}`;
    }
    catch {
        // Fallback: attempt to split manually.
        const [path = '', search = ''] = withoutHash.split('?');
        const p = path.startsWith('/') ? path : `/${path}`;
        const s = search ? `?${search}` : '';
        return `${p}${dedupeSearch(s)}`;
    }
};
const fetchPageContext = async (targetUrl, args) => {
    if (typeof window === 'undefined')
        return null;
    if (!targetUrl)
        return null;
    ensureTelemetryLoaded();
    telemetry.networkCalls += 1;
    bump(telemetry.networkByReason, args.reason);
    recordEvent('network', targetUrl, args.reason);
    const res = await fetch(`/api/page-context?url=${encodeURIComponent(targetUrl)}`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'x-renia-page-context-reason': args.reason,
            'x-renia-client-instance': args.clientInstance ?? '',
            'x-renia-nav-seq': String(args.navSeq)
        }
    });
    if (!res.ok) {
        recordEvent('response', targetUrl, args.reason);
        return null;
    }
    try {
        const json = (await res.json());
        recordEvent('response', targetUrl, args.reason);
        return json;
    }
    catch (error) {
        recordEvent('error', targetUrl, args.reason);
        return null;
    }
};
export const getPageContextPayload = async (url, args) => {
    const targetUrl = normalizeTargetUrl(url);
    if (!targetUrl)
        return null;
    ensureTelemetryLoaded();
    telemetry.callsTotal += 1;
    bump(telemetry.callsByReason, args.reason);
    bump(telemetry.callsByPath, targetUrl.split('?')[0] ?? targetUrl);
    recordEvent('call', targetUrl, args.reason);
    const cached = pageContextCache.get(targetUrl);
    if (cached !== undefined) {
        telemetry.cacheHits += 1;
        recordEvent('cache_hit', targetUrl, args.reason);
        return cached;
    }
    telemetry.cacheMisses += 1;
    recordEvent('cache_miss', targetUrl, args.reason);
    return pageContextCache.getOrSet(targetUrl, () => fetchPageContext(targetUrl, args));
};
export const prefetchPageContext = (url, args) => {
    void getPageContextPayload(url, { ...args, reason: 'prefetch' });
};
export default {
    getClientInstanceId,
    normalizeTargetUrl,
    getPageContextPayload,
    prefetchPageContext
};
