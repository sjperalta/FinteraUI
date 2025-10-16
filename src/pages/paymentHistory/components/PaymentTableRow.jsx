import { useLocale } from '../../../contexts/LocaleContext';

function PaymentTableRow({ 
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
    <tr 
      className={`hover:bg-gray-50 dark:hover:bg-darkblack-500 transition-colors ${isOverdue ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
      aria-label={isOverdue ? 'Overdue payment' : undefined}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatDate(payment.created_at)}
        </div>
        {payment.payment_date && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('paymentHistory.paidOn')}: {formatDate(payment.payment_date)}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {payment.description}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {payment.contract.lot.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {payment.contract.lot.project.name}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {getPaymentTypeIcon(payment.payment_type)} {t(`paymentHistory.types.${payment.payment_type}`)}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className={`text-sm font-bold ${isOverdue ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>
          {formatCurrency(payment.total_amount, payment.contract.currency)}
        </div>
        {payment.interest_amount > 0 && (
          <div className="text-xs text-red-600 dark:text-red-400">
            +{formatCurrency(payment.interest_amount, payment.contract.currency)} {t('paymentHistory.interest')}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
          {t(`payments.statusOptions.${payment.status}`)}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={() => onViewDetails(payment)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {t('paymentHistory.viewDetails')}
        </button>
      </td>
    </tr>
  );
}

export default PaymentTableRow;
