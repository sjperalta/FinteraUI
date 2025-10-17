import { useState } from "react";
// Adjust these imports based on your project structure
import { API_URL } from "../../../config";  // e.g. "http://localhost:3000" or your prod URL
import { getToken } from "../../../auth";   // If you use token-based auth
import DatePicker from "../forms/DatePicker";
import { useLocale } from "../../contexts/LocaleContext";
import Toast from "../ui/Toast";

function Report() {
  // Store the selected start/end dates in ISO format (e.g., "2025-01-15")
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const { t } = useLocale();

  /**
   * Utility function to open the CSV endpoint in a new tab,
   * prompting a file download. Appends `start_date` and `end_date`
   * as query params.
   *
   * @param {string} reportEndpoint - e.g. "commissions_csv", "total_revenue_csv", or "overdue_payments_csv"
   */
  
  const downloadCSV = async (reportEndpoint) => {
    // Validate that both dates are selected
    if (!startDate || !endDate) {
      setToast({ visible: true, message: t('reports.selectBothDates'), type: "error" });
      return;
    }

    // Validate that start date is not after end date
    if (new Date(startDate) > new Date(endDate)) {
      setToast({ visible: true, message: t('reports.startDateAfterEndDate'), type: "error" });
      return;
    }

    try {
      const token = getToken(); // Retrieve your Bearer token
      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
  
      // Build the full URL
      const url = `${API_URL}/api/v1/reports/${reportEndpoint}?${queryParams.toString()}`;
  
      // 1) Fetch with headers for auth
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error(t('reports.fetchCsvFailed'));
      }
  
      // 2) Convert response -> Blob
      const blob = await res.blob();
  
      // 3) Create a temporary link to download
      //    e.g. "commissions_report.csv" or something more dynamic
      const filename = `${reportEndpoint}.csv`; // You can refine if you prefer
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
  
      // 4) Programmatically click the link
      document.body.appendChild(link);
      link.click();
  
      // 5) Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Error downloading CSV:", err);
      setToast({ visible: true, message: t('reports.downloadError'), type: "error" });
    }
  };

  return (
    <aside className="w-full bg-white dark:bg-darkblack-600 rounded-xl shadow-lg border border-gray-100 dark:border-darkblack-500 overflow-visible">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-bgray-50 to-gray-100 dark:from-darkblack-700 dark:to-darkblack-600 px-6 py-4 border-b border-gray-200 dark:border-darkblack-500">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-bgray-900 dark:text-white">
              {t('reports.financialReports')}
            </h3>
            <p className="text-sm text-bgray-500 dark:text-bgray-300">
              {t('reports.downloadByDateRange')}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Date Range Selection */}
        <div className="mb-6 space-y-4">
          <DatePicker
            label={t('reports.startDate')}
            value={startDate}
            onChange={(value) => {
              setStartDate(value);
            }}
            placeholder={t('reports.selectStartDate')}
            required
          />

          <DatePicker
            label={t('reports.endDate')}
            value={endDate}
            onChange={(value) => {
              setEndDate(value);
            }}
            placeholder={t('reports.selectEndDate')}
            required
          />
        </div>

        {/* Download Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-bgray-900 dark:text-white text-sm">
              {t('reports.availableReports')}
            </h4>
            {(!startDate || !endDate) && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                {t('reports.selectDates')}
              </span>
            )}
          </div>
          {/* 
            We have 3 different CSV exports: 
              1) commissions_csv
              2) total_revenue_csv
              3) overdue_payments_csv
            Let's attach them to the 3 items below
          */}

          <div className="space-y-3">
            {/* Commissions.csv */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-darkblack-500 dark:to-darkblack-400 py-4 px-4 flex justify-between items-center rounded-lg border border-green-200 dark:border-darkblack-400 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center gap-x-3">
                <span className="bg-white dark:bg-darkblack-600 w-12 h-12 rounded-lg inline-flex justify-center items-center shadow-sm">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.8334 2.74951V6.41618C12.8334 6.65929 12.93 6.89245 13.1019 7.06436C13.2738 7.23627 13.5069 7.33285 13.75 7.33285H17.4167"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.5834 19.2495H6.41671C5.93048 19.2495 5.46416 19.0564 5.12034 18.7125C4.77653 18.3687 4.58337 17.9024 4.58337 17.4162V4.58285C4.58337 4.09661 4.77653 3.6303 5.12034 3.28648C5.46416 2.94267 5.93048 2.74951 6.41671 2.74951H12.8334L17.4167 7.33285V17.4162C17.4167 17.9024 17.2236 18.3687 16.8797 18.7125C16.5359 19.0564 16.0696 19.2495 15.5834 19.2495Z"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <h5 className="font-semibold text-bgray-900 dark:text-white text-sm">
                    {t('reports.commissionsCsv')}
                  </h5>
                  <span className="text-xs text-bgray-500 dark:text-bgray-400 cursor-pointer hover:text-green-600 transition-colors" onClick={() => downloadCSV("commissions_csv")}>
                    {t('reports.clickToDownload')}
                  </span>
                </div>
              </div>
              <button
                className={`p-2 rounded-lg transition-all duration-200 ${
                  (!startDate || !endDate) 
                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50' 
                    : 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 group-hover:scale-105'
                }`}
                aria-label={t('reports.downloadCommissions')}
                onClick={() => downloadCSV("commissions_csv")}
                disabled={!startDate || !endDate}
              >
                <svg
                  className={(!startDate || !endDate) 
                    ? "stroke-gray-400 dark:stroke-gray-600" 
                    : "stroke-green-600 dark:stroke-green-400"
                  }
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 12.4995V15.8328C17.5 16.2749 17.3244 16.6988 17.0118 17.0114C16.6993 17.3239 16.2754 17.4995 15.8333 17.4995H4.16667C3.72464 17.4995 3.30072 17.3239 2.98816 17.0114C2.67559 16.6988 2.5 16.2749 2.5 15.8328V12.4995"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.83337 8.33301L10 12.4997L14.1667 8.33301"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 12.4995V2.49951"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Flujo Ingreso.csv => total_revenue_csv */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-darkblack-500 dark:to-darkblack-400 py-4 px-4 flex justify-between items-center rounded-lg border border-blue-200 dark:border-darkblack-400 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center gap-x-3">
                <span className="bg-white dark:bg-darkblack-600 w-12 h-12 rounded-lg inline-flex justify-center items-center shadow-sm">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.8334 2.74951V6.41618C12.8334 6.65929 12.93 6.89245 13.1019 7.06436C13.2738 7.23627 13.5069 7.33285 13.75 7.33285H17.4167"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.5834 19.2495H6.41671C5.93048 19.2495 5.46416 19.0564 5.12034 18.7125C4.77653 18.3687 4.58337 17.9024 4.58337 17.4162V4.58285C4.58337 4.09661 4.77653 3.6303 5.12034 3.28648C5.46416 2.94267 5.93048 2.74951 6.41671 2.74951H12.8334L17.4167 7.33285V17.4162C17.4167 17.9024 17.2236 18.3687 16.8797 18.7125C16.5359 19.0564 16.0696 19.2495 15.5834 19.2495Z"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <h5 className="font-semibold text-bgray-900 dark:text-white text-sm">
                    {t('reports.revenueFlowCsv')}
                  </h5>
                  <span className="text-xs text-bgray-500 dark:text-bgray-400 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => downloadCSV("total_revenue_csv")}>
                    {t('reports.clickToDownload')}
                  </span>
                </div>
              </div>
              <button
                className={`p-2 rounded-lg transition-all duration-200 ${
                  (!startDate || !endDate) 
                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50' 
                    : 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 group-hover:scale-105'
                }`}
                aria-label={t('reports.downloadRevenueFlow')}
                onClick={() => downloadCSV("total_revenue_csv")}
                disabled={!startDate || !endDate}
              >
                <svg
                  className={(!startDate || !endDate) 
                    ? "stroke-gray-400 dark:stroke-gray-600" 
                    : "stroke-blue-600 dark:stroke-blue-400"
                  }
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 12.4995V15.8328C17.5 16.2749 17.3244 16.6988 17.0118 17.0114C16.6993 17.3239 16.2754 17.4995 15.8333 17.4995H4.16667C3.72464 17.4995 3.30072 17.3239 2.98816 17.0114C2.67559 16.6988 2.5 16.2749 2.5 15.8328V12.4995"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.83337 8.33301L10 12.4997L14.1667 8.33301"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 12.4995V2.49951"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Morosidad.csv => overdue_payments_csv */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-darkblack-500 dark:to-darkblack-400 py-4 px-4 flex justify-between items-center rounded-lg border border-red-200 dark:border-darkblack-400 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center gap-x-3">
                <span className="bg-white dark:bg-darkblack-600 w-12 h-12 rounded-lg inline-flex justify-center items-center shadow-sm">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.8334 2.74951V6.41618C12.8334 6.65929 12.93 6.89245 13.1019 7.06436C13.2738 7.23627 13.5069 7.33285 13.75 7.33285H17.4167"
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.5834 19.2495H6.41671C5.93048 19.2495 5.46416 19.0564 5.12034 18.7125C4.77653 18.3687 4.58337 17.9024 4.58337 17.4162V4.58285C4.58337 4.09661 4.77653 3.6303 5.12034 3.28648C5.46416 2.94267 5.93048 2.74951 6.41671 2.74951H12.8334L17.4167 7.33285V17.4162C17.4167 17.9024 17.2236 18.3687 16.8797 18.7125C16.5359 19.0564 16.0696 19.2495 15.5834 19.2495Z"
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <h5 className="font-semibold text-bgray-900 dark:text-white text-sm">
                    {t('reports.overduePaymentsCsv')}
                  </h5>
                  <span className="text-xs text-bgray-500 dark:text-bgray-400 cursor-pointer hover:text-red-600 transition-colors" onClick={() => downloadCSV("overdue_payments_csv")}>
                    {t('reports.clickToDownload')}
                  </span>
                </div>
              </div>
              <button
                className={`p-2 rounded-lg transition-all duration-200 ${
                  (!startDate || !endDate) 
                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50' 
                    : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 group-hover:scale-105'
                }`}
                aria-label={t('reports.downloadOverdue')}
                onClick={() => downloadCSV("overdue_payments_csv")}
                disabled={!startDate || !endDate}
              >
                <svg
                  className={(!startDate || !endDate) 
                    ? "stroke-gray-400 dark:stroke-gray-600" 
                    : "stroke-red-600 dark:stroke-red-400"
                  }
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 12.4995V15.8328C17.5 16.2749 17.3244 16.6988 17.0118 17.0114C16.6993 17.3239 16.2754 17.4995 15.8333 17.4995H4.16667C3.72464 17.4995 3.30072 17.3239 2.98816 17.0114C2.67559 16.6988 2.5 16.2749 2.5 15.8328V12.4995"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.83337 8.33301L10 12.4997L14.1667 8.33301"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 12.4995V2.49951"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((s) => ({ ...s, visible: false }))}
      />
    </aside>
  );
}

export default Report;