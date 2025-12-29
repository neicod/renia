// @env: mixed
import React from 'react';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import SortSelector from './SortSelector';
import PageSizeSelector from './PageSizeSelector';
import { toolbarStyles } from './toolbarStyles';

type SortOption = {
  value: string;
  label: string;
};

type Props = {
  sortOptions: SortOption[];
  selectedSort: string;
  onSortChange: (nextSort: string) => void;
  totalItems?: number;
  currentPage: number;
  itemsPerPage: number;
  pageSizeOptions: number[];
  onItemsPerPageChange: (nextPageSize: number) => void;
  disabled?: boolean;
};

export const ProductListingToolbar: React.FC<Props> = ({
  sortOptions,
  selectedSort,
  onSortChange,
  totalItems,
  currentPage,
  itemsPerPage,
  pageSizeOptions,
  onItemsPerPageChange,
  disabled
}) => {
  const { t } = useI18n();

  const start = totalItems ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0;
  const end = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;
  const perPageOptions = pageSizeOptions && pageSizeOptions.length ? pageSizeOptions : [itemsPerPage];

  return (
    <div style={toolbarStyles.container}>
      <div style={toolbarStyles.infoText}>
        {totalItems
          ? t('catalog.listing.showing', { start, end, total: totalItems })
          : t('catalog.listing.title')}
      </div>

      <div style={toolbarStyles.selectorsContainer}>
        <SortSelector
          options={sortOptions}
          selectedValue={selectedSort}
          onChange={onSortChange}
          disabled={disabled}
        />
        <PageSizeSelector
          options={perPageOptions}
          selectedValue={itemsPerPage}
          onChange={onItemsPerPageChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ProductListingToolbar;

