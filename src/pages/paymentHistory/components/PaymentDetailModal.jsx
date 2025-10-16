import { useLocale } from '../../../contexts/LocaleContext';

function PaymentDetailModal({ 
  payment, 
  onClose, 
  formatCurrency, 
  formatDate, 
  getStatusBadge, 
  getPaymentTypeIcon 
}) {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-darkblack-600 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2">{getPaymentTypeIcon(payment.payment_type)}</span>
              {t('paymentHistory.paymentDetails')}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(payment.status)}`}>
              {t(`payments.statusOptions.${payment.status}`)}
            </span>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-darkblack-500 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('paymentHistory.paymentId')}
              </p>
              <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                #{payment.id}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-darkblack-500 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('paymentHistory.paymentType')}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {t(`paymentHistory.types.${payment.payment_type}`)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-darkblack-500 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('paymentHistory.createdDate')}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDate(payment.created_at)}
              </p>
            </div>

            {payment.payment_date && (
              <div className="bg-gray-50 dark:bg-darkblack-500 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('paymentHistory.paidDate')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(payment.payment_date)}
                </p>
              </div>
            )}

            {payment.due_date && (
              <div className="bg-gray-50 dark:bg-darkblack-500 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('paymentHistory.dueDate')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(payment.due_date)}
                </p>
              </div>
            )}

            {payment.approved_at && (
              <div className="bg-gray-50 dark:bg-darkblack-500 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('paymentHistory.approvedDate')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(payment.approved_at)}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-2 font-semibold">
              {t('paymentHistory.description')}
            </p>
            <p className="text-sm text-blue-900 dark:text-blue-100">
              {payment.description}
            </p>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
              {t('paymentHistory.amountBreakdown')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 dark:text-green-300">
                  {t('paymentHistory.baseAmount')}
                </span>
                <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {formatCurrency(payment.amount, payment.contract.currency)}
                </span>
              </div>
              {payment.interest_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {t('paymentHistory.interest')}
                  </span>
                  <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                    +{formatCurrency(payment.interest_amount, payment.contract.currency)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-green-300 dark:border-green-700 flex justify-between items-center">
                <span className="text-base font-bold text-green-900 dark:text-green-100">
                  {t('paymentHistory.amount')}
                </span>
                <span className="text-lg font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(payment.total_amount, payment.contract.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Contract Information */}
          <div className="bg-gray-50 dark:bg-darkblack-500 rounded-lg p-4 border border-gray-200 dark:border-darkblack-400">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('paymentHistory.contractInfo')}
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('paymentHistory.contractId')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  #{payment.contract.id} - {payment.contract.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('paymentHistory.financingType')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t(`contracts.financingTypes.${payment.contract.financing_type}`)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('paymentHistory.lot')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {payment.contract.lot.name}
                </p>
                {payment.contract.lot.address && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📍 {payment.contract.lot.address}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('paymentHistory.project')}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {payment.contract.lot.project.name}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Information */}
          {payment.has_receipt && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('paymentHistory.receiptAttached')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-darkblack-500 px-6 py-4 rounded-b-2xl border-t border-gray-200 dark:border-darkblack-400">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-darkblack-600 dark:hover:bg-darkblack-500 text-gray-800 dark:text-gray-200 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailModal;
