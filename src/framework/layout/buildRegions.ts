// @env: mixed
import type { LayoutNode } from './LayoutTree';

export type RegionEntry = {
  region: string;
  id?: string;
  component?: string;
  componentPath?: string;
  enabled?: boolean;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  priority?: number;
};

export type RegionsSnapshot = Record<string, RegionEntry[]>;

export const buildRegions = (root: LayoutNode): RegionsSnapshot => {
  const regions: RegionsSnapshot = {};

  for (const regionNode of root.children.values()) {
    const region = regionNode.id;
    if (!regions[region]) regions[region] = [];

    if (regionNode.component || regionNode.componentPath) {
      regions[region].push({
        region,
        component: regionNode.component as any,
        componentPath: regionNode.componentPath,
        priority: 0,
        props: regionNode.props,
        meta: regionNode.meta
      });
    }

    for (const child of regionNode.children.values()) {
      if (child.component || child.componentPath) {
        regions[region].push({
          region,
          id: child.id,
          component: child.component as any,
          componentPath: child.componentPath,
          priority: 0,
          enabled: true,
          props: child.props,
          meta: child.meta
        });
      }
    }
  }

  return regions;
};

export default buildRegions;

