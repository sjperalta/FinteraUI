import React, { useEffect, useState, useContext } from "react";
import TotalWidget from "../../component/widget/TotalWidget";
import RevenueFlow from "../../component/revenueFlow";
import ListTab from "../../component/listTab";
import Efficiency from "../../component/revenueFlow/Efficiency";
import Report from "../../component/report";
import AuthContext from "../../context/AuthContext";
import { getToken } from "../../../auth";
import { API_URL } from "../../../config";

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

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/v1/statistics`, {
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
  }, [token]);

  return (
    <main className="w-full px-6 pb-6 pt-[100px] sm:pt-[156px] xl:px-12 xl:pb-12">
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