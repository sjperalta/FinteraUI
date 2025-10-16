import { useLocale } from '../../../contexts/LocaleContext';

function EmptyState() {
  const { t } = useLocale();

  return (
    <div className="bg-white dark:bg-darkblack-600 rounded-lg p-12 text-center border border-gray-200 dark:border-darkblack-400">
      <div className="text-gray-400 mb-4">
        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {t('paymentHistory.noPayments')}
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        {t('paymentHistory.noPaymentsDescription')}
      </p>
    </div>
  );
}

export default EmptyState;
