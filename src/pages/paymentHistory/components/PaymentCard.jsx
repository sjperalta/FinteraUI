import { useLocale } from '../../../contexts/LocaleContext';

function PaymentCard({ 
  payment, 
  formatCurrency, 
  formatDate, 
  getStatusBadge, 
  getPaymentTypeIcon,
  onViewDetails 
}) {
  const { t } = useLocale();
  const isOverdue = payment.due_date && !payment.payment_date && new Date(payment.due_date) < new Date();

  return (
    <div 
      className={`p-4 hover:bg-gray-50 dark:hover:bg-darkblack-500 transition-colors ${isOverdue ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
      aria-label={isOverdue ? 'Overdue payment' : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{getPaymentTypeIcon(payment.payment_type)}</span>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {payment.description}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {payment.contract.lot.name} - {payment.contract.lot.project.name}
          </p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
          {t(`payments.statusOptions.${payment.status}`)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('paymentHistory.table.date')}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(payment.created_at)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('paymentHistory.table.amount')}
          </p>
          <p className={`text-sm font-bold ${isOverdue ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>
            {formatCurrency(payment.total_amount, payment.contract.currency)}
          </p>
          {payment.interest_amount > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400">
              +{formatCurrency(payment.interest_amount, payment.contract.currency)} {t('paymentHistory.interest')}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => onViewDetails(payment)}
        className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {t('paymentHistory.viewDetails')}
      </button>
    </div>
  );
}

export default PaymentCard;
