// @env: mixed
import React from 'react';

/**
 * usePagination - Manage pagination state and calculations
 *
 * Responsibilities:
 * - Manage current page state
 * - Calculate offset for GraphQL queries
 * - Validate and constrain page numbers
 *
 * @param pageSize - Items per page
 * @param total - Total items count (for page validation)
 * @param initialPage - Starting page (default: 1)
 * @returns Pagination state and handlers
 */
export const usePagination = (
  pageSize: number,
  total: number,
  initialPage: number = 1
) => {
  const [page, setPage] = React.useState<number>(
    !Number.isFinite(initialPage) || initialPage < 1 ? 1 : initialPage
  );

  /**
   * Safe page size (at least 1 to prevent division by zero)
   */
  const pageSizeSafe = React.useMemo(() => Math.max(pageSize, 1), [pageSize]);

  /**
   * Calculate total pages based on total items and page size
   */
  const totalPages = React.useMemo(() => {
    return Math.max(1, Math.ceil(Math.max(total, 0) / pageSizeSafe));
  }, [total, pageSizeSafe]);

  /**
   * Constrain page to valid range [1, totalPages]
   */
  const safeCurrentPage = React.useMemo(() => {
    return Math.min(Math.max(page, 1), totalPages);
  }, [page, totalPages]);

  /**
   * GraphQL offset = (page - 1) * pageSize
   */
  const offset = React.useMemo(() => {
    return (safeCurrentPage - 1) * pageSizeSafe;
  }, [safeCurrentPage, pageSizeSafe]);

  /**
   * Handle page change with validation
   */
  const handlePageChange = React.useCallback(
    (nextPage: number) => {
      const safe = Math.min(Math.max(nextPage, 1), totalPages);
      setPage(safe);
    },
    [totalPages]
  );

  /**
   * Reset to first page
   */
  const handleResetPage = React.useCallback(() => {
    setPage(1);
  }, []);

  return React.useMemo(
    () => ({
      page: safeCurrentPage,
      totalPages,
      pageSize: pageSizeSafe,
      offset,
      setPage: handlePageChange,
      resetPage: handleResetPage
    }),
    [safeCurrentPage, totalPages, pageSizeSafe, offset, handlePageChange, handleResetPage]
  );
};

export default usePagination;
