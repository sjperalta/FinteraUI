import { useLocale } from '../../../contexts/LocaleContext';

function FiltersSection({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paymentTypeFilter,
  setPaymentTypeFilter,
  dateRangeFilter,
  setDateRangeFilter,
}) {
  const { t } = useLocale();

  const hasActiveFilters = searchTerm || statusFilter || paymentTypeFilter || dateRangeFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPaymentTypeFilter('');
    setDateRangeFilter('all');
  };

  return (
    <div className="bg-white dark:bg-darkblack-600 rounded-lg p-4 sm:p-6 shadow-md border border-gray-200 dark:border-darkblack-400 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('paymentHistory.search')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('paymentHistory.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg bg-white dark:bg-darkblack-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('paymentHistory.status')}
          </label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg bg-white dark:bg-darkblack-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('paymentHistory.allStatuses')}</option>
            <option value="paid">{t('payments.statusOptions.paid')}</option>
            <option value="pending">{t('payments.statusOptions.pending')}</option>
            <option value="submitted">{t('payments.statusOptions.submitted')}</option>
            <option value="rejected">{t('payments.statusOptions.rejected')}</option>
          </select>
        </div>

        {/* Payment Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('paymentHistory.paymentType')}
          </label>
          <select 
            value={paymentTypeFilter} 
            onChange={(e) => setPaymentTypeFilter(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg bg-white dark:bg-darkblack-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('paymentHistory.allTypes')}</option>
            <option value="reserve">{t('paymentHistory.types.reserve')}</option>
            <option value="down_payment">{t('paymentHistory.types.downPayment')}</option>
            <option value="installment">{t('paymentHistory.types.installment')}</option>
            <option value="capital_repayment">{t('paymentHistory.types.capitalRepayment')}</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('paymentHistory.dateRange')}
          </label>
          <select 
            value={dateRangeFilter} 
            onChange={(e) => setDateRangeFilter(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg bg-white dark:bg-darkblack-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('paymentHistory.allTime')}</option>
            <option value="month">{t('paymentHistory.thisMonth')}</option>
            <option value="quarter">{t('paymentHistory.thisQuarter')}</option>
            <option value="year">{t('paymentHistory.thisYear')}</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('paymentHistory.clearFilters')}
          </button>
        </div>
      )}
    </div>
  );
}

export default FiltersSection;
