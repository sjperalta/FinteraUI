import { useLocale } from '../../../contexts/LocaleContext';

function Pagination({ currentPage, totalPages, perPage, onPageChange, onPerPageChange }) {
  const { t } = useLocale();

  if (totalPages <= 1 && !onPerPageChange) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Page info and per page selector */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('paymentHistory.showingPage', { current: currentPage, total: totalPages })}
        </div>
        
        {/* Per page selector */}
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.itemsPerPage') || 'Items per page'}:
            </label>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-darkblack-400 rounded-lg bg-white dark:bg-darkblack-600 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-darkblack-600 border border-gray-300 dark:border-darkblack-400 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkblack-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t('common.firstPage') || 'First'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Previous button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-darkblack-600 border border-gray-300 dark:border-darkblack-400 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkblack-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('common.previous')}
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white border border-blue-500'
                    : 'bg-white dark:bg-darkblack-600 border border-gray-300 dark:border-darkblack-400 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkblack-500'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Current page indicator (mobile only) */}
        <span className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentPage} / {totalPages}
        </span>

        {/* Next button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-darkblack-600 border border-gray-300 dark:border-darkblack-400 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkblack-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('common.next')}
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-darkblack-600 border border-gray-300 dark:border-darkblack-400 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-darkblack-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t('common.lastPage') || 'Last'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Pagination;
