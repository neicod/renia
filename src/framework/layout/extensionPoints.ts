// @env: mixed
import type { SlotEntry } from 'renia-layout/types';
import type { SubslotEntry } from './subslots';

/**
 * Unified extension point entry - works for both slots and subslots
 * The framework automatically determines context (global vs nested)
 */
export type ExtensionPoint = {
  name: string; // 'header', 'product-listing-actions', etc.
  componentPath?: string;
  component?: string;
  category?: string;
  priority?: number;
  id?: string;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

/**
 * Determine if an extension point is a global slot or a nested subslot
 * Global slots: 'header', 'footer', 'content', 'left', 'control-menu', 'global-overlay'
 * Nested subslots: anything registered via interceptors (product-listing-actions, etc.)
 */
const GLOBAL_SLOTS = ['header', 'footer', 'content', 'left', 'control-menu', 'global-overlay'];

export const isGlobalSlot = (name: string): boolean => GLOBAL_SLOTS.includes(name);

/**
 * Convert unified extension point to slot entry
 */
export const extensionToSlotEntry = (ext: ExtensionPoint): SlotEntry => ({
  slot: ext.name,
  componentPath: ext.componentPath,
  component: ext.component,
  priority: ext.priority ?? 0,
  category: ext.category,
  id: ext.id,
  props: ext.props,
  meta: ext.meta
});

/**
 * Convert unified extension point to subslot entry
 */
export const extensionToSubslotEntry = (ext: ExtensionPoint): SubslotEntry => ({
  slot: ext.name,
  componentPath: ext.componentPath,
  component: ext.component,
  priority: ext.priority ?? 0,
  category: ext.category,
  id: ext.id,
  enabled: true,
  props: ext.props,
  meta: ext.meta
});
