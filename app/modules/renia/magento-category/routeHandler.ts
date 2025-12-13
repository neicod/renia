// @env: server
import type {SearchCriteria} from '@framework/api';
import {createCategoryRepository} from './services/categoryRepository';
import {prefetchProductListing} from 'renia-magento-catalog/services/productListingPrefetch';
import type {ProductSearchResults} from 'magento-product';

const DEFAULT_PAGE_SIZE = 12;

const buildInitialCriteria = (categoryUid: string): SearchCriteria => ({
  filterGroups: [{ filters: [{ field: 'category_uid', value: categoryUid }] }],
  pageSize: DEFAULT_PAGE_SIZE,
  currentPage: 1
});

const fetchInitialProductListing = async (
  categoryUid?: string
): Promise<ProductSearchResults | null> => {
  if (!categoryUid) return null;
  try {
    const criteria = buildInitialCriteria(categoryUid);
    return await prefetchProductListing(criteria);
  } catch (error) {
    console.error('[CategoryRouteHandler] Failed to fetch initial product listing', {
      categoryUid,
      error
    });
    return null;
  }
};

export default async function handleCategoryRoute({ req }: { req: { path: string } }) {
  const repo = createCategoryRepository();
  const path = req.path.replace(/^\/+category\/?/, '').replace(/\/+$/, '');
  if (!path) return {};
  try {
    const category = await repo.getByUrlPath(path);
    if (!category) return { meta: { categoryUrlPath: path } };

    const categoryProductListing = await fetchInitialProductListing(category.id);

    return {
      meta: {
        categoryUrlPath: path,
        category,
        categoryProductListing
      }
    };
  } catch (error) {
    console.error('[CategoryRouteHandler] Failed to resolve category', { path, error });
    return { meta: { categoryUrlPath: path } };
  }
}
