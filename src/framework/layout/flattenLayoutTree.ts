// @env: mixed
import type { LayoutNode } from './LayoutTree';
import type { SlotEntry } from './types';

type Flattened = {
  slots: Record<string, SlotEntry[]>;
  subslots: Record<string, SlotEntry[]>;
};

export const flattenLayoutTree = (root: LayoutNode): Flattened => {
  const slots: Record<string, SlotEntry[]> = {};
  const subslots: Record<string, SlotEntry[]> = {};

  const walk = (node: LayoutNode, isRootLevel: boolean = false) => {
    for (const child of node.children.values()) {
      if (isRootLevel) {
        const slotName = child.id;
        if (!slots[slotName]) slots[slotName] = [];

        if (child.component || child.componentPath) {
          slots[slotName].push({
            slot: slotName,
            component: child.component as any,
            componentPath: child.componentPath,
            priority: 0,
            props: child.props,
            meta: child.meta
          });
        }

        for (const grandchild of child.children.values()) {
          if (grandchild.component || grandchild.componentPath) {
            slots[slotName].push({
              slot: slotName,
              component: grandchild.component as any,
              componentPath: grandchild.componentPath,
              priority: 0,
              id: grandchild.id,
              props: grandchild.props,
              meta: grandchild.meta
            });
          }
        }
      } else {
        const slotName = node.id;
        if (!subslots[slotName]) subslots[slotName] = [];

        if (child.component || child.componentPath) {
          subslots[slotName].push({
            slot: slotName,
            component: child.component as any,
            componentPath: child.componentPath,
            priority: 0,
            id: child.id,
            props: child.props,
            meta: child.meta
          });
        }

        if (child.children.size > 0) {
          walk(child, false);
        }
      }
    }
  };

  walk(root, true);
  return { slots, subslots };
};

export default flattenLayoutTree;

