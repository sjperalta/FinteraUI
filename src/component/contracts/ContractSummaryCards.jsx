import PropTypes from 'prop-types';
import { useLocale } from '../../contexts/LocaleContext';

const ContractSummaryCards = ({ summary, currentContract, fmt }) => {
  const { t } = useLocale();

  if (!summary) return null;

  const financingType = currentContract?.financing_type?.toLowerCase();
  const isBankOrCash = financingType === 'bank' || financingType === 'cash';

  return (
    <div className="grid grid-cols-2 md:grid-cols-8 gap-2 px-4 py-3 text-xs border-b border-bgray-200 dark:border-darkblack-400">
      <div className="flex-shrink-0 p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500 min-w-[120px]">
        <p className="text-bgray-500 dark:text-bgray-400 whitespace-nowrap">{t("contracts.price")}</p>
        <p className="font-semibold text-bgray-900 dark:text-white whitespace-nowrap">{fmt(summary.price)}</p>
      </div>
      <div className="flex-shrink-0 p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500 min-w-[120px]">
        <p className="text-bgray-500 dark:text-bgray-400 whitespace-nowrap">{t("contracts.reserve")}</p>
        <p className="font-semibold text-bgray-900 dark:text-white whitespace-nowrap">{fmt(summary.reserve)}</p>
      </div>
      {!isBankOrCash && (
        <div className="flex-shrink-0 p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500 min-w-[120px]">
          <p className="text-bgray-500 dark:text-bgray-400 whitespace-nowrap">{t("contracts.downPayment")}</p>
          <p className="font-semibold text-bgray-900 dark:text-white whitespace-nowrap">{fmt(summary.downPayment)}</p>
        </div>
      )}
      <div className="flex-shrink-0 p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500 min-w-[120px]">
        <p className="text-bgray-500 dark:text-bgray-400 whitespace-nowrap">{t("contracts.financed")}</p>
        <p className="font-semibold text-success-600 dark:text-success-400 whitespace-nowrap">{fmt(summary.financed)}</p>
      </div>
      <div className="flex-shrink-0 p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500 min-w-[120px]">
        <p className="text-bgray-500 dark:text-bgray-400 whitespace-nowrap">{t("contracts.balance")}</p>
        <p className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{fmt(currentContract?.balance)}</p>
      </div>
      {!isBankOrCash && (
        <div className="flex-shrink-0 p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500 min-w-[120px]">
          <p className="text-bgray-500 dark:text-bgray-400 whitespace-nowrap">{t("contracts.months")}</p>
          <p className="font-semibold text-bgray-900 dark:text-white whitespace-nowrap">{summary.term || "—"}</p>
        </div>
      )}
      {!isBankOrCash && (
        <div className="flex-shrink-0 p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500 min-w-[120px]">
          <p className="text-bgray-500 dark:text-bgray-400 whitespace-nowrap">{t("contracts.estimatedInstallment")}</p>
          <p className="font-semibold text-bgray-900 dark:text-white whitespace-nowrap">{fmt(summary.monthly)}</p>
        </div>
      )}
    </div>
  );
};

ContractSummaryCards.propTypes = {
  summary: PropTypes.object,
  currentContract: PropTypes.object,
  fmt: PropTypes.func.isRequired
};

export default ContractSummaryCards;