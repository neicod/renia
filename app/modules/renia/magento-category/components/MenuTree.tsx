// @env: mixed
import React from 'react';
import { Link } from 'react-router-dom';
import type { MenuItem } from 'renia-menu';

type MenuTreeProps = {
  items: MenuItem[];
  depth?: number;
};

const isInternalPath = (url: string): boolean => {
  if (!url) return false;
  if (url === '#') return false;
  if (url.startsWith('http://') || url.startsWith('https://')) return false;
  if (url.startsWith('//')) return false;
  return url.startsWith('/');
};

/**
 * Rekurencyjny komponent do renderowania menu w strukturze drzewa.
 * Obsługuje: nested children, CSS classes per-level, ARIA attributes.
 *
 * Implementuje SOLID: SRP (single responsibility - tree rendering)
 *                     OCP (extensible via depth-based styling)
 */
export const MenuTree: React.FC<MenuTreeProps> = ({ items, depth = 0 }) => {
  if (!items.length) return null;

  const listProps =
    depth === 0
      ? { className: 'main-menu' }
      : { className: 'main-menu__dropdown', role: 'menu' as const, 'aria-hidden': true };

  return (
    <ul {...listProps}>
      {items.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const itemClass = depth === 0 ? 'main-menu__item' : 'main-menu__dropdown-item';
        const linkClass = depth === 0 ? 'main-menu__link' : 'main-menu__dropdown-link';
        const childMenu = hasChildren && (
          <MenuTree items={node.children ?? []} depth={depth + 1} />
        );

        return (
          <li key={node.id} className={itemClass}>
            {isInternalPath(node.url) ? (
              <Link className={linkClass} to={node.url}>
                {node.label}
              </Link>
            ) : (
              <a className={linkClass} href={node.url}>
                {node.label}
              </a>
            )}
            {childMenu}
          </li>
        );
      })}
    </ul>
  );
};

export default MenuTree;
