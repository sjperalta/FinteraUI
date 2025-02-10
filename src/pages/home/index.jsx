import React, { useEffect, useState, useContext } from "react";
import TotalWidget from "../../component/widget/TotalWidget";
import RevenueFlow from "../../component/revenueFlow";
import Report from "../../component/report";
import AuthContext from "../../context/AuthContext";
import { getToken } from "../../../auth";
import { API_URL } from "../../../config";

// A MonthSelector component with prev/next buttons and a dropdown for month selection
function MonthSelector({ selectedMonth, onChange }) {
  // Format the selected month (e.g., "March 2025")
  const monthYear = selectedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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
    <div className="flex items-center justify-left space-x-2 my-4">
      <button
        onClick={handlePrev}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        Anterior
      </button>
      <select
        value={selectedMonth.getMonth()}
        onChange={(e) => {
          const newMonth = parseInt(e.target.value, 10);
          const newDate = new Date(selectedMonth.getFullYear(), newMonth, 1);
          onChange(newDate);
        }}
        className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {Array.from({ length: 12 }).map((_, index) => {
          const date = new Date(selectedMonth.getFullYear(), index, 1);
          return (
            <option key={index} value={index}>
              {date.toLocaleDateString("en-US", { month: "long" })}
            </option>
          );
        })}
      </select>
      <span className="font-semibold">{selectedMonth.getFullYear()}</span>
      <button
        onClick={handleNext}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        Siguiente
      </button>
    </div>
  );
}

function Home() {
  const { user } = useContext(AuthContext); // To use user data if needed
  const token = getToken(); // Authentication token

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

  // Optionally, if your API supports filtering by month, you can include the selected month
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);

      try {
        // If your API accepts month filtering, you might include:
        const month = selectedMonth.getMonth() + 1; // 1-indexed month
        const year = selectedMonth.getFullYear();
        const response = await fetch(`${API_URL}/api/v1/statistics?month=${month}&year=${year}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error fetching statistics data");
        }

        const data = await response.json();
        setStatistics(data); // Update statistics state
      } catch (err) {
        setError(err.message); // Handle errors
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchStatistics();
  }, [token, selectedMonth]);

  return (
    <main className="w-full px-6 pb-6 pt-[100px] sm:pt-[156px] xl:px-12 xl:pb-12">
      {/* Month Selector */}
      <MonthSelector
        selectedMonth={selectedMonth}
        onChange={(newMonth) => setSelectedMonth(newMonth)}
      />

      {/* Error and Loading States */}
      {loading && <div className="loader">Loading...</div>}
      {error && (
        <div
          className="error-container flex flex-col items-center justify-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="2xl:flex 2xl:space-x-[48px]">
          <section className="mb-6 2xl:mb-0 3xl:flex-1">
            <TotalWidget statistics={statistics} />
            <div className="w-full rounded-lg bg-white px-[24px] py-[20px] dark:bg-darkblack-600">
              <div className="flex flex-col space-y-6">
                <div className="flex h-[400px] w-full space-x-4">
                  <RevenueFlow />
                </div>
              </div>
            </div>
          </section>
          <section className="flex w-full flex-col space-x-0 lg:flex-row lg:space-x-6 2xl:w-[400px] 2xl:flex-col 2xl:space-x-0">
            <Report />
          </section>
        </div>
      )}
    </main>
  );
}

export default Home;