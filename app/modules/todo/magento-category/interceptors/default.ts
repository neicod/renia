// @env: mixed
import { CategoryHeader } from '../components/CategoryHeader';
import { CategoryMainMenu } from '../components/CategoryMainMenu';
import { CategoryHero } from '../components/CategoryHero';
import { CategoryPage } from '../pages/CategoryPage';
import { registerCategoryPageContextAugmenter } from '../services/pageContextAugmenter';

export default (api: any) => {
  if (typeof window === 'undefined') {
    registerCategoryPageContextAugmenter();
  }

  api.registerComponents?.({
    'renia-magento-category/components/CategoryHeader': CategoryHeader,
    'renia-magento-category/components/CategoryMainMenu': CategoryMainMenu,
    'renia-magento-category/components/CategoryHero': CategoryHero,
    'renia-magento-category/pages/CategoryPage': CategoryPage
  });

  // Inject CategoryMainMenu into header region
  api.layout
    .at('header')
    .add(
      'renia-magento-category/components/CategoryMainMenu',
      'category-main-menu',
      { sortOrder: { before: '-' } }
    );
};
