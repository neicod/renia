// @env: server
import {createCategoryRepository} from './services/categoryRepository';

export default async function handleCategoryRoute({ req }: { req: { path: string } }) {
  const repo = createCategoryRepository();
  const path = req.path.replace(/^\/+category\/?/, '').replace(/\/+$/, '');
  if (!path) return {};
  try {
    const category = await repo.getByUrlPath(path);
    if (!category) return {};

    return {
      meta: {
        category: {
          id: category.id,
          label: category.label,
          urlPath: category.urlPath,
          description: category.description,
          image: category.image
        }
      }
    };
  } catch (error) {
    console.error('[CategoryRouteHandler] Failed to resolve category', { path, error });
    return {};
  }
}
