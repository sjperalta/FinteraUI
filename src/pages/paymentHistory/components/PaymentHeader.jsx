import { useLocale } from '../../../contexts/LocaleContext';

function PaymentHeader() {
  const { t } = useLocale();

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('paymentHistory.title')}</h1>
            <p className="text-blue-100">{t('paymentHistory.subtitle')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentHeader;
