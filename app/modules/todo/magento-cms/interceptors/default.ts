// @env: mixed
import { CmsPage } from '../pages/CmsPage';
import { registerCmsPageContextAugmenter } from '../services/pageContextAugmenter';

export default (api: any) => {
  if (typeof window === 'undefined') {
    registerCmsPageContextAugmenter();
  }

  api.registerComponents?.({
    'renia-magento-cms/pages/CmsPage': CmsPage
  });
};

