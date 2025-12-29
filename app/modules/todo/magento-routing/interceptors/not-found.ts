// @env: mixed
export default (api: any) => {
  api.layout.at('content').add('renia-magento-routing/pages/NotFoundPage', 'not-found-page', {
    sortOrder: { before: '-' }
  });
};

