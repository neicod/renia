// @env: server
import { createCategoryRepository } from './services/categoryRepository';

export default async function handleCategoryRoute({ req }: { req: { path: string } }) {
  const repo = createCategoryRepository();
  const path = req.path.replace(/^\/+category\/?/, '').replace(/\/+$/, '');
  if (!path) return {};
  try {
    const category = await repo.getByUrlPath(path);
    if (!category) return { meta: { categoryUrlPath: path } };

    return {
      meta: {
        categoryUrlPath: path,
        category
      }
    };
  } catch {
    return { meta: { categoryUrlPath: path } };
  }
}
