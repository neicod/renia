// @env: mixed
import type { Category } from '../types/category';
import { toAbsolutePath } from '@renia/framework/router/paths';

export const mapCategoryNode = (node: any): Category => ({
  id: String(node?.uid ?? node?.id ?? node?.name ?? Math.random()),
  label: node?.name ?? 'Category',
  url: toAbsolutePath(node?.url_path) ?? '#',
  urlPath: node?.url_path ?? undefined,
  type: 'category',
  position: typeof node?.position === 'number' ? node.position : undefined,
  includeInMenu: node?.include_in_menu !== false,
  description: node?.description ?? undefined,
  image: node?.image ?? undefined,
  children: Array.isArray(node?.children) ? node.children.map(mapCategoryNode) : []
});

export default mapCategoryNode;
