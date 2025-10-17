import React, { useEffect, useState, useContext } from "react";
import TotalWidget from "../../component/widget/TotalWidget";
import RevenueFlow from "../../component/revenueFlow";
import Report from "../../component/report";
import Toast from "../../component/ui/Toast";
import AuthContext from "../../context/AuthContext";
import { getToken } from "../../../auth";
import { API_URL } from "../../../config";
import { useLocale } from "../../contexts/LocaleContext";

// A MonthSelector component with prev/next buttons, dropdown for month selection, and refresh button
function MonthSelector({ selectedMonth, onChange, locale, onRefresh, refreshing }) {
  const { t } = useLocale();
  // Prefer explicit locale prop (from user), otherwise fall back to navigator or 'es-ES'
  const userLocale = locale || (typeof navigator !== 'undefined' && navigator.language) || 'es-ES';
  // Handler to go to the previous month
  const handlePrev = () => {
    const newDate = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() - 1,
      1
    );
    onChange(newDate);
  };

  // Handler to go to the next month
  const handleNext = () => {
    const newDate = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      1
    );
    onChange(newDate);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      {/* Header Section with Current Date */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-md">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7h8M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M5 10h14" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-bgray-900 dark:text-white truncate">
            {t('home.analysisPeriod')}
          </h3>
          {/* Current selection badge - below title */}
          <div className="inline-flex items-center space-x-1 px-2 py-0.5 mt-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-full">
            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              {selectedMonth.toLocaleDateString(userLocale, { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Controls - Compact Design */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-3 flex-1 sm:flex-initial">
        <button
          onClick={handlePrev}
          className="group inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-darkblack-700 dark:to-darkblack-600 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-darkblack-600 dark:hover:to-darkblack-500 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
          aria-label={t('home.previous')}
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden xs:inline ml-1">{t('home.previous')}</span>
        </button>
        
        <div className="flex items-center space-x-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-darkblack-700 dark:to-darkblack-600 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/50 shadow-sm">
          <select
            value={selectedMonth.getMonth()}
            onChange={(e) => {
              const newMonth = parseInt(e.target.value, 10);
              const newDate = new Date(selectedMonth.getFullYear(), newMonth, 1);
              onChange(newDate);
            }}
            className="px-2 py-1 bg-white dark:bg-darkblack-500 border border-blue-200 dark:border-blue-800/50 rounded text-sm text-bgray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            {Array.from({ length: 12 }).map((_, index) => {
              const date = new Date(selectedMonth.getFullYear(), index, 1);
              return (
                <option key={index} value={index}>
                  {date.toLocaleDateString(userLocale, { month: "short" })}
                </option>
              );
            })}
          </select>
          <div className="h-6 w-px bg-blue-300 dark:bg-blue-700"></div>
          <span className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 px-1">
            {selectedMonth.getFullYear()}
          </span>
        </div>
        
        <button
          onClick={handleNext}
          className="group inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-darkblack-700 dark:to-darkblack-600 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-darkblack-600 dark:hover:to-darkblack-500 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
          aria-label={t('home.next')}
        >
          <span className="hidden xs:inline mr-1">{t('home.next')}</span>
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Refresh Statistics Button */}
      <div className="flex items-center flex-shrink-0">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md"
            aria-label={t('home.updateStatistics')}
          >
            {refreshing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden xs:inline">{t('home.updatingStatistics')}</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{t('home.updateStatistics')}</span>
              </>
            )}
          </button>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const token = getToken();

  const [statistics, setStatistics] = useState({
    total_income: 0,
    total_interest: 0,
    new_customers: 0,
    new_contracts: 0,
    payment_reserve: 0,
    payment_installments: 0,
    payment_down_payment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  // Set selectedMonth as the first day of the current month
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [refreshing, setRefreshing] = useState(false);

  // Fetch statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const month = selectedMonth.getMonth() + 1; // 1-indexed month
        const year = selectedMonth.getFullYear();

        const response = await fetch(`${API_URL}/api/v1/statistics?month=${month}&year=${year}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error fetching statistics data: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        // Normalize the data with potential field mappings
        const normalizedData = {
          ...data,
          payment_reserve: data.payment_reserve ?? data.reservas ?? data.total_reserves ?? 0,
          payment_down_payment: data.payment_down_payment ?? data.prima ?? data.total_down_payments ?? 0,
          payment_installments: data.payment_installments ?? data.cuotas ?? data.total_installments ?? 0,
          new_contracts: data.new_contracts ?? data.total_new_contracts ?? data.contracts_count ?? 0,
        };

        setStatistics(normalizedData);

        // If payment fields are still missing, try an alternative endpoint
        if (!normalizedData.payment_reserve && !normalizedData.payment_down_payment && !normalizedData.payment_installments) {
          try {
            const paymentResponse = await fetch(`${API_URL}/api/v1/payments/statistics?month=${month}&year=${year}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              setStatistics(prev => ({
                ...prev,
                payment_reserve: paymentData.payment_reserve ?? paymentData.reservas ?? prev.payment_reserve,
                payment_down_payment: paymentData.payment_down_payment ?? paymentData.prima ?? prev.payment_down_payment,
                payment_installments: paymentData.payment_installments ?? paymentData.cuotas ?? prev.payment_installments,
              }));
            }
          } catch (_) {
            // Ignore alternative endpoint errors
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [token, selectedMonth]);

  // Function to refresh statistics
  const handleRefreshStats = async () => {
    setRefreshing(true);
    try {
      const dateParam = selectedMonth.toISOString().split('T')[0];

      const response = await fetch(`${API_URL}/api/v1/statistics/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: dateParam
        }),
      });

      if (!response.ok) {
        throw new Error('Error refreshing statistics');
      }

      // After successful refresh, wait a few seconds then fetch the updated statistics
      setTimeout(async () => {
        try {
          const statsResponse = await fetch(`${API_URL}/api/v1/statistics?month=${selectedMonth.getMonth() + 1}&year=${selectedMonth.getFullYear()}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (statsResponse.ok) {
            const updatedStats = await statsResponse.json();
            setStatistics(updatedStats);
          }

          // Show success message
          setToast({ visible: true, message: t('home.statisticsUpdated'), type: "success" });
        } catch (err) {
          console.error('Error fetching updated statistics:', err);
          setToast({ visible: true, message: t('home.errorFetchingUpdatedStats'), type: "error" });
        } finally {
          setRefreshing(false);
        }
      }, 3000); // Wait 3 seconds
    } catch (err) {
      console.error('Error refreshing statistics:', err);
      setToast({ visible: true, message: t('home.errorUpdatingStats'), type: "error" });
      setRefreshing(false);
    }
  };

  return (
    <main className="w-full px-3 sm:px-6 pb-6 pt-[80px] xs:pt-[90px] sm:pt-[100px] md:pt-[120px] lg:pt-[156px] xl:px-12 xl:pb-12 2xl:px-16">
      {/* Month Selector - Compact with integrated refresh button */}
      <div className="mb-4 sm:mb-5">
        <div className="bg-white dark:bg-darkblack-600 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-300">
          <MonthSelector
            selectedMonth={selectedMonth}
            onChange={(newMonth) => setSelectedMonth(newMonth)}
            locale={user?.locale}
            onRefresh={handleRefreshStats}
            refreshing={refreshing}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <div className="text-center px-4">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 border-opacity-25 border-t-blue-600 mx-auto mb-4 sm:mb-6"></div>
            <h3 className="text-lg sm:text-xl font-semibold text-bgray-900 dark:text-white mb-2">{t('home.loadingDashboard')}</h3>
            <p className="text-sm sm:text-base text-bgray-600 dark:text-bgray-50">{t('home.gettingLatestInfo')}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-4">
          <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 sm:p-8 rounded-xl border border-red-200 dark:border-red-800 max-w-md w-full">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-red-800 dark:text-red-300 mb-3">{t('home.connectionError')}</h3>
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-4 sm:mb-6 break-words">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('home.retry')}
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Content - Mobile Optimized */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-2 2xl:col-span-3 space-y-4 sm:space-y-6">
            <TotalWidget statistics={statistics} />
            <div className="w-full rounded-lg sm:rounded-xl bg-white dark:bg-darkblack-600 shadow-lg border border-gray-100 dark:border-darkblack-500 overflow-hidden">
              <div className="bg-gradient-to-r from-bgray-50 to-gray-100 dark:from-darkblack-700 dark:to-darkblack-600 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-darkblack-500">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-bgray-900 dark:text-white truncate">
                      {t('home.revenueProjection')}
                    </h3>
                    <p className="text-xs sm:text-sm text-bgray-500 dark:text-bgray-300 truncate">
                      {t('home.revenueProjectionDescription')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="h-[300px] sm:h-[350px] lg:h-[400px] xl:h-[450px] 2xl:h-[500px]">
                  <RevenueFlow selectedYear={selectedMonth.getFullYear()} currentMonth={selectedMonth.getMonth() + 1} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar with Reports */}
          <div className="xl:col-span-1 2xl:col-span-1">
            <Report />
          </div>
        </div>
      )}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((s) => ({ ...s, visible: false }))} />
    </main>
  );
}

export default Home;