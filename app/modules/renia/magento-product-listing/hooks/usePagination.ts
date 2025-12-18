// @env: mixed
import React from 'react';

export const usePagination = (pageSize: number, total: number, initialPage: number = 1) => {
  const [page, setPage] = React.useState<number>(
    !Number.isFinite(initialPage) || initialPage < 1 ? 1 : initialPage
  );

  const pageSizeSafe = React.useMemo(() => Math.max(pageSize, 1), [pageSize]);

  const totalPages = React.useMemo(() => {
    return Math.max(1, Math.ceil(Math.max(total, 0) / pageSizeSafe));
  }, [total, pageSizeSafe]);

  const safeCurrentPage = page;

  const offset = React.useMemo(() => {
    return (safeCurrentPage - 1) * pageSizeSafe;
  }, [safeCurrentPage, pageSizeSafe]);

  const handlePageChange = React.useCallback(
    (nextPage: number) => {
      const safe = Math.min(Math.max(nextPage, 1), totalPages);
      setPage(safe);
    },
    [totalPages]
  );

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
    [safeCurrentPage, pageSizeSafe, offset, handlePageChange, handleResetPage]
  );
};

export default usePagination;

