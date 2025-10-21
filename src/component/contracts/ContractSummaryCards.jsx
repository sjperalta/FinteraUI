import PropTypes from 'prop-types';
import { useLocale } from '../../contexts/LocaleContext';

const ContractSummaryCards = ({ summary, currentContract, fmt }) => {
  const { t } = useLocale();

  if (!summary) return null;

  const financingType = currentContract?.financing_type?.toLowerCase();
  const isBankOrCash = financingType === 'bank' || financingType === 'cash';

  return (
    <div className="grid grid-cols-2 md:grid-cols-8 gap-2 px-4 py-3 text-xs border-b border-bgray-200 dark:border-darkblack-400">
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">{t("contracts.financingType")}</p>
        <p className="font-semibold text-bgray-900 dark:text-white">
          {currentContract?.financing_type ? 
            t(`contractDetailsModal.financingTypes.${currentContract.financing_type.toLowerCase()}`) : 
            "—"
          }
        </p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">{t("contracts.price")}</p>
        <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.price)}</p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">{t("contracts.reserve")}</p>
        <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.reserve)}</p>
      </div>
      {!isBankOrCash && (
        <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
          <p className="text-bgray-500 dark:text-bgray-400">{t("contracts.downPayment")}</p>
          <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.downPayment)}</p>
        </div>
      )}
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">{t("contracts.financed")}</p>
        <p className="font-semibold text-success-600 dark:text-success-400">{fmt(summary.financed)}</p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">{t("contracts.balance")}</p>
        <p className="font-semibold text-blue-600 dark:text-blue-400">{fmt(currentContract?.balance)}</p>
      </div>
      {!isBankOrCash && (
        <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
          <p className="text-bgray-500 dark:text-bgray-400">{t("contracts.months")}</p>
          <p className="font-semibold text-bgray-900 dark:text-white">{summary.term || "—"}</p>
        </div>
      )}
      {!isBankOrCash && (
        <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
          <p className="text-bgray-500 dark:text-bgray-400">{t("contracts.estimatedInstallment")}</p>
          <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.monthly)}</p>
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