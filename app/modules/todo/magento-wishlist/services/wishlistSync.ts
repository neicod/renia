// @env: mixed
import type { SearchCriteria } from '@renia/framework/api';
import { productRepository } from 'renia-magento-product';
import { wishlistStore } from './wishlistStore';

const buildCriteriaForSkus = (skus: string[]): SearchCriteria => ({
  filterGroups: [
    {
      filters: [
        {
          field: 'sku',
          conditionType: 'in',
          value: skus.join(',')
        }
      ]
    }
  ],
  pageSize: Math.max(1, skus.length),
  currentPage: 1
});

export const needsWishlistRefresh = () => wishlistStore.hasExpiredItems();

export const refreshWishlistProducts = async () => {
  const skus = wishlistStore.getExpiredSkus();
  if (!skus.length) return;
  const criteria = buildCriteriaForSkus(skus);
  const results = await productRepository.getList(criteria);
  if (results.items?.length) {
    wishlistStore.refreshFromProducts(results.items);
  }
};

export default {
  needsWishlistRefresh,
  refreshWishlistProducts
};
