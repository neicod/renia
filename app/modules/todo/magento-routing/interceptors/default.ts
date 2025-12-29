// @env: mixed
import { NotFoundPage } from '../pages/NotFoundPage';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-routing/pages/NotFoundPage': NotFoundPage
  });
};

