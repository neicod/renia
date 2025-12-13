// @env: mixed
import type { Category } from '../types/category';

export const mapCategoryNode = (node: any): Category => ({
  id: String(node?.uid ?? node?.id ?? node?.name ?? Math.random()),
  label: node?.name ?? 'Category',
  url: node?.url_path ? `/category/${node.url_path}` : '#',
  urlPath: node?.url_path ?? undefined,
  type: 'category',
  position: typeof node?.position === 'number' ? node.position : undefined,
  includeInMenu: node?.include_in_menu !== false,
  children: Array.isArray(node?.children) ? node.children.map(mapCategoryNode) : []
});

export default mapCategoryNode;
