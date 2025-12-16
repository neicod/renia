// @env: mixed
import Layout1Column from '../layouts/1column';
import Layout2ColumnsLeft from '../layouts/2columns-left';
import LayoutEmpty from '../layouts/empty';
import { CategoryMainMenu } from 'renia-magento-category/components/CategoryMainMenu';

export default (api: any) => {
  api.registerComponents?.({
    'renia-layout/layouts/1column': Layout1Column,
    'renia-layout/layouts/2columns-left': Layout2ColumnsLeft,
    'renia-layout/layouts/empty': LayoutEmpty,
    'renia-magento-category/components/CategoryMainMenu': CategoryMainMenu
  });

  api.layout.get('header').add('renia-magento-category/components/CategoryMainMenu', 'category-main-menu', {
    sortOrder: { before: '-' }
  });
};
