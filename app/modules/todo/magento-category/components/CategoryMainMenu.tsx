// @env: mixed
import React from 'react';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { configService } from '../services/configService';
import { useMenuData } from '../hooks/useMenuData';
import { MenuTree } from './MenuTree';
import { MenuStateMessage } from './MenuStateMessage';

/**
 * CategoryMainMenu - główny orchestrator menu kategorii.
 *
 * Odpowiedzialności:
 * - Dependency injection (configService)
 * - Koordinacja: data fetching (useMenuData) + rendering (MenuTree)
 * - Conditional rendering based on status
 *
 * Przed: 139 linii, 6 odpowiedzialności (God Component)
 * Po: ~30 linii, 1 odpowiedzialność (Orchestrator)
 *
 * Implementuje SOLID: SRP (orchestrator only)
 *                     DIP (dependency injection via configService)
 */
export const CategoryMainMenu: React.FC = () => {
  const { t } = useI18n();
  const { items, status } = useMenuData({ configService });
  const endpoint = configService.getGraphQLEndpoint();

  // Conditional rendering based on status
  if (!endpoint) {
    return <MenuStateMessage message={t('category.menu.noEndpoint')} />;
  }

  if (status === 'error') {
    return <MenuStateMessage message={t('category.menu.error')} tone="error" />;
  }

  if (status === 'loading' && items.length === 0) {
    return <MenuStateMessage message={t('category.menu.loading')} tone="info" />;
  }

  if (status === 'empty') {
    return <MenuStateMessage message={t('category.menu.empty')} />;
  }

  return <MenuTree items={items} />;
};

export default CategoryMainMenu;
