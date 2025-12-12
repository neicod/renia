// @env: server

export type RouteDefinition = {
  path: string;
  componentPath?: string;
  component?: string;
  handler?: string;
  redirect?: string;
  status?: number;
  priority?: number;
  guards?: string[];
  meta?: Record<string, unknown>;
};

export type RouterOptions = {
  routesFileName?: string; // domyślnie routes.js / routes.ts
  configPath?: string;
  includeNodeModules?: boolean;
  statusMap?: Record<string, boolean | number | undefined>;
};

export type RouterEntry = RouteDefinition & { module: string };
