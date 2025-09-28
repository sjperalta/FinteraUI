import PropTypes from 'prop-types';

const ContractSummaryCards = ({ summary, currentContract, fmt }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-2 px-4 py-3 text-xs border-b border-bgray-200 dark:border-darkblack-400">
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">Precio</p>
        <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.price)}</p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">Reserva</p>
        <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.reserve)}</p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">Prima</p>
        <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.prima)}</p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">Financiado</p>
        <p className="font-semibold text-success-600 dark:text-success-400">{fmt(summary.financed)}</p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">Balance</p>
        <p className="font-semibold text-blue-600 dark:text-blue-400">{fmt(currentContract?.balance)}</p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">Meses</p>
        <p className="font-semibold text-bgray-900 dark:text-white">{summary.term || "—"}</p>
      </div>
      <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
        <p className="text-bgray-500 dark:text-bgray-400">Cuota Est.</p>
        <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.monthly)}</p>
      </div>
    </div>
  );
};

ContractSummaryCards.propTypes = {
  summary: PropTypes.object,
  currentContract: PropTypes.object,
  fmt: PropTypes.func.isRequired
};

export default ContractSummaryCards;