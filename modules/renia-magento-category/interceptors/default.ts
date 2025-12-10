export default (api: any) => {
  if (api?.slots?.add) {
    api.slots.add({
      slot: 'header',
      componentPath: 'renia-magento-category/components/CategoryMainMenu',
      priority: 50,
      id: 'category-main-menu'
    });
  }
};
