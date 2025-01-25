import React, { useState, useEffect, useContext } from "react";
import BarChart from "../chart/BarChart";
import DateFilter from "../forms/DateFilter";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { ThemeContext } from "../layout";

function RevenueFlow() {
  const { theme } = useContext(ThemeContext); // Access theme (light/dark)
  const token = getToken(); // Retrieve authentication token

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to the current year
  const [datasets, setDatasets] = useState([]); // Chart datasets
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Fetch monthly revenue data from the API
  const fetchMonthlyRevenue = async (year) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/statistics/monthly_revenue?year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch monthly revenue data");
      }

      const data = await response.json();
      setDatasets(data.datasets); // Update the datasets for the chart
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the selected year changes
  useEffect(() => {
    fetchMonthlyRevenue(selectedYear);
  }, [selectedYear]);

  // Chart.js options
  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === "dark" ? "rgba(34, 38, 46, 1)" : "rgba(243, 246, 255, 1)",
          borderDash: [5, 5],
          borderDashOffset: 2,
        },
        gridLines: {
          zeroLineColor: "rgb(243 ,246, 255 ,1)",
        },
        ticks: {
          color: theme === "dark" ? "white" : "black",
          callback: (value) => `$${value}`, // Format y-axis values as currency
        },
      },
      x: {
        ticks: {
          color: theme === "dark" ? "white" : "black",
        },
        grid: {
          color: theme === "dark" ? "rgba(34, 38, 46, 1)" : "rgba(243, 246, 255, 1)",
          borderDash: [5, 5],
          borderDashOffset: 2,
        },
        gridLines: {
          zeroLineColor: "rgb(243 ,246, 255 ,1)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  };

  const chartData = {
    labels: months, // Use month labels
    datasets: datasets, // Use datasets from API
  };

  return (
    <div className="flex w-full flex-col justify-between rounded-lg bg-white px-[24px] py-3 dark:bg-darkblack-600 xl:w-66">
      <div className="mb-2 flex items-center justify-between border-b border-bgray-300 pb-2 dark:border-darkblack-400">
        <h3 className="text-xl font-bold text-bgray-900 dark:text-white sm:text-2xl">
          Flujo de Financientos
        </h3>

        <div className="hidden items-center space-x-[28px] sm:flex">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-warning-300"></div>
            <span className="text-sm font-medium text-bgray-700 dark:text-bgray-50">
              Reserva
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-success-300"></div>
            <span className="text-sm font-medium text-bgray-700 dark:text-bgray-50">
              Prima
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-orange"></div>
            <span className="text-sm font-medium text-bgray-700 dark:text-bgray-50">
              Cuotas
            </span>
          </div>
        </div>

        {/* Year Selector */}
        <DateFilter
          options={[2021, 2022, 2023, 2024]} // Available years
          onChange={(year) => setSelectedYear(year)}
          defaultValue={selectedYear}
        />
      </div>

      {/* Chart Section */}
      <div className="w-full h-[300px]">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <BarChart options={chartOptions} data={chartData} />
        )}
      </div>
    </div>
  );
}

export default RevenueFlow;