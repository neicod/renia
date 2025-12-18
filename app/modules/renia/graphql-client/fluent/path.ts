// @env: mixed

export const parsePath = (path?: string): string[] => {
  if (!path) return [];
  const trimmed = path.trim();
  if (!trimmed) return [];
  return trimmed.split('.').map((s) => s.trim()).filter(Boolean);
};

export const formatPath = (segments: string[]): string => segments.join('.');

