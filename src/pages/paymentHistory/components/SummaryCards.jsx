import { useLocale } from '../../../contexts/LocaleContext';

function SummaryCards({ total, balance, paymentCount, countPaidDone, overdueAmount, formatCurrency }) {
  const { t } = useLocale();

  const cards = [
    {
      label: t('paymentHistory.Total'),
      value: formatCurrency(total),
      icon: (
        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: t('paymentHistory.balance'),
      value: formatCurrency(balance),
      icon: (
        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: t('paymentHistory.numberOfPayments'),
      value: paymentCount,
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: t('paymentHistory.paidCount'),
      value: countPaidDone,
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
      ),
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
    {
      label: t('paymentHistory.overDueAmount'),
      value: formatCurrency(overdueAmount),
      icon: (
        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
      ),
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-darkblack-600 rounded-lg p-4 shadow-md border border-gray-200 dark:border-darkblack-400"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-3 ${card.bgColor} rounded-lg`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
