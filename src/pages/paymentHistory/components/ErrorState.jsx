import { useLocale } from '../../../contexts/LocaleContext';

function ErrorState({ error }) {
  const { t } = useLocale();

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="flex items-center">
        <svg 
          className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <div>
          <h3 className="text-red-800 dark:text-red-300 font-semibold">
            {t('common.error')}
          </h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    </div>
  );
}

export default ErrorState;
