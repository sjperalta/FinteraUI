import React, { useEffect, useState, useContext } from "react";
import TotalWidget from "../../component/widget/TotalWidget";
import RevenueFlow from "../../component/revenueFlow";
import Report from "../../component/report";
import AuthContext from "../../context/AuthContext";
import { getToken } from "../../../auth";
import { API_URL } from "../../../config";

// A MonthSelector component with prev/next buttons and a dropdown for month selection
function MonthSelector({ selectedMonth, onChange }) {
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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7h8M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M5 10h14" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-bgray-900 dark:text-white">
            Período de Análisis
          </h3>
          <p className="text-sm text-bgray-500 dark:text-bgray-300">
            Selecciona el mes y año para ver los datos
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={handlePrev}
          className="inline-flex items-center px-3 py-2 bg-white dark:bg-darkblack-700 border border-gray-300 dark:border-darkblack-500 rounded-lg text-sm font-medium text-bgray-700 dark:text-bgray-200 hover:bg-gray-50 dark:hover:bg-darkblack-600 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-darkblack-700 p-2 rounded-lg">
          <select
            value={selectedMonth.getMonth()}
            onChange={(e) => {
              const newMonth = parseInt(e.target.value, 10);
              const newDate = new Date(selectedMonth.getFullYear(), newMonth, 1);
              onChange(newDate);
            }}
            className="px-3 py-2 bg-transparent border-0 text-bgray-900 dark:text-white font-medium focus:outline-none focus:ring-0"
          >
            {Array.from({ length: 12 }).map((_, index) => {
              const date = new Date(selectedMonth.getFullYear(), index, 1);
              return (
                <option key={index} value={index}>
                  {date.toLocaleDateString("es-ES", { month: "long" })}
                </option>
              );
            })}
          </select>
          <span className="text-xl font-bold text-bgray-900 dark:text-white px-2">
            {selectedMonth.getFullYear()}
          </span>
        </div>
        
        <button
          onClick={handleNext}
          className="inline-flex items-center px-3 py-2 bg-white dark:bg-darkblack-700 border border-gray-300 dark:border-darkblack-500 rounded-lg text-sm font-medium text-bgray-700 dark:text-bgray-200 hover:bg-gray-50 dark:hover:bg-darkblack-600 transition-colors duration-200"
        >
          Siguiente
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useContext(AuthContext);
  const token = getToken();

  const [statistics, setStatistics] = useState({
    total_income: 0,
    total_interest: 0,
    new_customers: 0,
    payment_reserve: 0,
    payment_installments: 0,
    payment_down_payment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // After successful refresh, fetch the updated statistics
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
      alert('Estadísticas actualizadas correctamente');
    } catch (err) {
      console.error('Error refreshing statistics:', err);
      alert('Error al actualizar las estadísticas');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="w-full px-6 pb-6 pt-[100px] sm:pt-[156px] xl:px-12 xl:pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Dashboard Principal</h1>
                <p className="text-blue-100">
                  Bienvenido {user?.name || 'Usuario'}, aquí está tu resumen ejecutivo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Stats Button */}
      <div className="mb-8">
        <div className="flex justify-center lg:justify-end">
          <button
            onClick={handleRefreshStats}
            disabled={refreshing}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando Estadísticas...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar Estadísticas
              </>
            )}
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="mb-8">
        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-darkblack-500">
          <MonthSelector
            selectedMonth={selectedMonth}
            onChange={(newMonth) => setSelectedMonth(newMonth)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 border-opacity-25 border-t-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-bgray-900 dark:text-white mb-2">Cargando Dashboard</h3>
            <p className="text-bgray-600 dark:text-bgray-50">Obteniendo la información más reciente...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border border-red-200 dark:border-red-800 max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-3">Error de conexión</h3>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-6">
            <TotalWidget statistics={statistics} />
            <div className="w-full rounded-xl bg-white dark:bg-darkblack-600 shadow-lg border border-gray-100 dark:border-darkblack-500 overflow-hidden">
              <div className="bg-gradient-to-r from-bgray-50 to-gray-100 dark:from-darkblack-700 dark:to-darkblack-600 px-6 py-4 border-b border-gray-200 dark:border-darkblack-500">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-bgray-900 dark:text-white">
                      Flujo de Ingresos
                    </h3>
                    <p className="text-sm text-bgray-500 dark:text-bgray-300">
                      Análisis mensual de ingresos por tipo de pago
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-[400px]">
                  <RevenueFlow selectedYear={selectedMonth.getFullYear()} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar with Reports */}
          <div className="xl:col-span-1">
            <Report />
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;