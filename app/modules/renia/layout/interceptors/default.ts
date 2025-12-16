// @env: mixed
import Layout1Column from '../layouts/1column';
import Layout2ColumnsLeft from '../layouts/2columns-left';
import LayoutEmpty from '../layouts/empty';

export default (api: any) => {
  api.registerComponents?.({
    'renia-layout/layouts/1column': Layout1Column,
    'renia-layout/layouts/2columns-left': Layout2ColumnsLeft,
    'renia-layout/layouts/empty': LayoutEmpty
  });
};
