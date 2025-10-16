import { useLocale } from '../../../contexts/LocaleContext';
import PaymentTableRow from './PaymentTableRow';

function PaymentTable({ 
  payments, 
  formatCurrency, 
  formatDate, 
  getStatusBadge, 
  getPaymentTypeIcon,
  onViewDetails 
}) {
  const { t } = useLocale();

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-darkblack-500 border-b-2 border-gray-200 dark:border-darkblack-400">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {t('paymentHistory.table.date')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {t('paymentHistory.table.description')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {t('paymentHistory.table.contract')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {t('paymentHistory.table.type')}
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {t('paymentHistory.table.amount')}
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {t('paymentHistory.table.status')}
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {t('paymentHistory.table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-darkblack-400">
          {payments.map((payment) => (
            <PaymentTableRow
              key={payment.id}
              payment={payment}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              getPaymentTypeIcon={getPaymentTypeIcon}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentTable;
