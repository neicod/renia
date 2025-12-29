// @env: mixed
import type { RegionsSnapshot, RegionEntry } from './buildRegions';
import type { ExtensionsSnapshot } from './ExtensionsRegistry';

export type LayoutValidationIssue = {
  level: 'warn' | 'error';
  code:
    | 'unknown_region'
    | 'duplicate_region_id'
    | 'missing_component'
    | 'invalid_component_ref'
    | 'duplicate_extension_id';
  message: string;
  data?: Record<string, unknown>;
};

export type ValidateLayoutArtifactsArgs = {
  regions: RegionsSnapshot;
  extensions?: ExtensionsSnapshot;
  isComponentRegistered: (name: string) => boolean;
  knownRegions?: string[];
};

const defaultKnownRegions = [
  'header',
  'control-menu',
  'content',
  'left',
  'footer',
  'global-overlay'
];

const getEntryComponentKey = (entry: RegionEntry): string | null => {
  if (typeof entry.componentPath === 'string' && entry.componentPath) return entry.componentPath;
  if (typeof entry.component === 'string' && entry.component) return entry.component;
  if (typeof entry.component === 'function') return null;
  return null;
};

export const validateLayoutArtifacts = ({
  regions,
  extensions,
  isComponentRegistered,
  knownRegions = defaultKnownRegions
}: ValidateLayoutArtifactsArgs): LayoutValidationIssue[] => {
  const issues: LayoutValidationIssue[] = [];
  const known = new Set(knownRegions);

  for (const regionName of Object.keys(regions)) {
    if (!known.has(regionName)) {
      issues.push({
        level: 'warn',
        code: 'unknown_region',
        message: `Unknown region "${regionName}" (not rendered by default layouts unless added).`,
        data: { region: regionName }
      });
    }

    const entries = regions[regionName] ?? [];
    const seenIds = new Set<string>();
    for (const entry of entries) {
      if (entry?.id) {
        if (seenIds.has(entry.id)) {
          issues.push({
            level: 'warn',
            code: 'duplicate_region_id',
            message: `Duplicate id "${entry.id}" in region "${regionName}".`,
            data: { region: regionName, id: entry.id }
          });
        }
        seenIds.add(entry.id);
      }

      if (typeof entry.component === 'function') {
        issues.push({
          level: 'warn',
          code: 'invalid_component_ref',
          message:
            `Region "${regionName}" contains a direct React component reference; register it and use componentPath string instead.`,
          data: { region: regionName, id: entry.id ?? null }
        });
        continue;
      }

      const key = getEntryComponentKey(entry);
      if (!key) continue;
      if (!isComponentRegistered(key)) {
        issues.push({
          level: 'warn',
          code: 'missing_component',
          message: `Component "${key}" referenced in region "${regionName}" is not registered.`,
          data: { region: regionName, component: key, id: entry.id ?? null }
        });
      }
    }
  }

  if (extensions) {
    for (const [host, outlets] of Object.entries(extensions)) {
      for (const [outlet, entries] of Object.entries(outlets ?? {})) {
        const seen = new Set<string>();
        for (const entry of entries ?? []) {
          if (entry?.id) {
            const k = `${host}::${outlet}::${entry.id}`;
            if (seen.has(k)) {
              issues.push({
                level: 'warn',
                code: 'duplicate_extension_id',
                message: `Duplicate extension id "${entry.id}" for host "${host}" outlet "${outlet}".`,
                data: { host, outlet, id: entry.id }
              });
            }
            seen.add(k);
          }

          if (entry?.componentPath && !isComponentRegistered(entry.componentPath)) {
            issues.push({
              level: 'warn',
              code: 'missing_component',
              message: `Component "${entry.componentPath}" referenced in extensions for "${host}.${outlet}" is not registered.`,
              data: { host, outlet, component: entry.componentPath, id: entry.id }
            });
          }
        }
      }
    }
  }

  return issues;
};

export default {
  validateLayoutArtifacts
};

