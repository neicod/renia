// @env: mixed
export default (api: any) => {
  api.layout.at('content').add('renia-magento-cms/pages/CmsPage', 'cms-page', {
    sortOrder: { before: '-' }
  });
};

