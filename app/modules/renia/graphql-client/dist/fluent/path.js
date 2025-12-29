// @env: mixed
export const parsePath = (path) => {
    if (!path)
        return [];
    const trimmed = path.trim();
    if (!trimmed)
        return [];
    return trimmed.split('.').map((s) => s.trim()).filter(Boolean);
};
export const formatPath = (segments) => segments.join('.');
