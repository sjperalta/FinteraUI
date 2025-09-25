import TotalWidgetCard from "./TotalWidgetCard";

function TotalWidget({ statistics }) {

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Helper function to format numbers
  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString('es-HN');
  };

  // Helper function to format large numbers with L currency (for money amounts)
  const formatLargeNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('es-HN');
  };

  return (
    <div className="mb-[32px] w-full">
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-3 xl:grid-cols-3">
        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <TotalWidgetCard
            title="Ingresos Totales"
            amount={formatLargeNumber(statistics.total_income)}
            groth={5.2} // You can calculate this based on previous period
            id="totalIncome"
            type="money"
            currency="L "
            cardType="income"
          />
        </div>
        
        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <TotalWidgetCard
            title="Intereses Moratorios"
            amount={formatLargeNumber(statistics.total_interest)}
            groth={3.1}
            id="totalInterest"
            type="money"
            currency="L "
            cardType="interest"
          />
        </div>
        
        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <TotalWidgetCard
            title="Nuevos Clientes"
            amount={formatNumber(statistics.new_customers)}
            groth={12.5}
            id="newCustomers"
            type="number"
            cardType="customers"
          />
        </div>
      </div>
      
      {/* Additional summary cards for payment breakdown */}
      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3 mt-6">
        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-4 border border-gray-200 dark:border-darkblack-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-bgray-500 dark:text-bgray-300">Reservas</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">L {formatNumber(statistics?.payment_reserve || 0)}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-4 border border-gray-200 dark:border-darkblack-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-bgray-500 dark:text-bgray-300">Prima</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">L {formatNumber(statistics?.payment_down_payment || 0)}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-4 border border-gray-200 dark:border-darkblack-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-bgray-500 dark:text-bgray-300">Cuotas</p>
              <p className="text-xl font-bold text-orange-600 dark:text-[rgb(255,120,75)]">L {formatNumber(statistics?.payment_installments || 0)}</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-[rgba(255,120,75,0.12)] rounded-lg">
              <svg className="w-5 h-5 text-orange-600 dark:text-[rgb(255,120,75)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotalWidget;