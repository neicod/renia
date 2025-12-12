// @env: server
import { registerComponent } from '@framework/registry/componentRegistryServer';
import { SearchBar } from '../components/SearchBar';
import { SearchProductList } from '../components/SearchProductList';

type SlotEntry = {
  slot: string;
  componentPath?: string;
  component?: string;
  id?: string;
  priority?: number;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

type SlotsApi = {
  slots?: {
    add?: (entry: SlotEntry) => void;
  };
};

export default (api: SlotsApi = {}) => {
  registerComponent('renia-magento-catalog-search/components/SearchBar', SearchBar);
  registerComponent('renia-magento-catalog-search/components/SearchProductList', SearchProductList);

  api.slots?.add?.({
    slot: 'control-menu',
    componentPath: 'renia-magento-catalog-search/components/SearchBar',
    id: 'search-bar',
    priority: 100
  });

  api.slots?.add?.({
    slot: 'content',
    componentPath: 'renia-magento-catalog-search/components/SearchProductList',
    id: 'search-product-list',
    priority: 20
  });
};
