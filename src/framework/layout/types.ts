// @env: mixed
export type SlotDefinition = {
  slot: string;
  component?: string;
  componentPath?: string;
  priority?: number;
  category?: string;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export type SlotEntry = SlotDefinition & { module?: string; id?: string; enabled?: boolean };
