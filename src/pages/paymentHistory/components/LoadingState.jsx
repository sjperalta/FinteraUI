import { useLocale } from '../../../contexts/LocaleContext';

function LoadingState() {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{t('paymentHistory.loading')}</p>
      </div>
    </div>
  );
}

export default LoadingState;
