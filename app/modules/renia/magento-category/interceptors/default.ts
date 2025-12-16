// @env: mixed
import { CategoryHeader } from '../components/CategoryHeader';
import { CategoryPage } from '../pages/CategoryPage';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-category/components/CategoryHeader': CategoryHeader,
    'renia-magento-category/pages/CategoryPage': CategoryPage
  });
};
