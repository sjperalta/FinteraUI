import { useState } from "react";
import Datepicker from "tailwind-datepicker-react";
// Adjust these imports based on your project structure
import { API_URL } from "../../../config";  // e.g. "http://localhost:3000" or your prod URL
import { getToken } from "../../../auth";   // If you use token-based auth

const options = {
  title: "Calendario",
  autoHide: true,
  todayBtn: false,
  clearBtn: true,
  clearBtnText: "Clear",
  maxDate: new Date("2030-01-01"),
  minDate: new Date("1950-01-01"),
  theme: {
    background: "",
    todayBtn: "",
    clearBtn: "",
    icons: "",
    text: "",
    disabledText: "bg-gray-300",
    input: "",
    inputIcon: "",
    selected: "bg-green-400",
  },
  icons: {
    prev: () => <span>Previous</span>,
    next: () => <span>Next</span>,
  },
  datepickerClassNames: "top-12",
  defaultDate: new Date(),
  language: "en",
  disabledDates: [],
  weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  inputNameProp: "date",
  inputIdProp: "date",
  inputPlaceholderProp: "Select Date",
  inputDateFormatProp: {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
};

function Report() {
  // Control the show/hide of each datepicker separately
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  // Store the selected start/end dates in ISO format (e.g., "2025-01-15")
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Called when user picks a start date
  const handleStartChange = (selectedDate) => {
    if (selectedDate) {
      const iso = selectedDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
      setStartDate(iso);
      console.log("Start Date:", iso);
    }
  };

  // Called when user picks an end date
  const handleEndChange = (selectedDate) => {
    if (selectedDate) {
      const iso = selectedDate.toISOString().split("T")[0];
      setEndDate(iso);
      console.log("End Date:", iso);
    }
  };

  // Closes the start datepicker
  const handleCloseStart = (state) => {
    setShowStart(state);
  };

  // Closes the end datepicker
  const handleCloseEnd = (state) => {
    setShowEnd(state);
  };

  /**
   * Utility function to open the CSV endpoint in a new tab,
   * prompting a file download. Appends `start_date` and `end_date`
   * as query params.
   *
   * @param {string} reportEndpoint - e.g. "commissions_csv", "total_revenue_csv", or "overdue_payments_csv"
   */
  
  const downloadCSV = async (reportEndpoint) => {
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
        throw new Error("Failed to fetch CSV");
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
    }
  };

  return (
    <aside className="2xl:w-[382px] w-full bg-white dark:bg-darkblack-600 rounded-lg px-12 pb-7">
      <header className="flex flex-col -mt-8 pb-7 mt-2 pt-4">
        <h3 className="text-xl font-bold text-bgray-900 dark:text-white">
            Reportes Financieros
        </h3>
      </header>

      {/* Start Date */}
      <h3>Fecha inicial</h3>
      <Datepicker
        options={options}
        onChange={handleStartChange}
        show={showStart}
        setShow={handleCloseStart}
      />

      <br />

      {/* End Date */}
      <h3>Fecha final</h3>
      <Datepicker
        options={options}
        onChange={handleEndChange}
        show={showEnd}
        setShow={handleCloseEnd}
      />

      <div className="py-6 border-b border-bgray-200 dark:border-darkblack-400">
        <h4 className="font-medium text-gray-500 text-sm dark:text-white mb-3">
          Files
        </h4>
        {/* 
          We have 3 different CSV exports: 
            1) commissions_csv
            2) total_revenue_csv
            3) overdue_payments_csv
          Let's attach them to the 3 items below
        */}

        <ul className="space-y-2.5">
          {/* Commissions.csv */}
          <li className="bg-[#E4FDED] dark:bg-darkblack-500 py-3 px-2 pr-4 flex justify-between items-center rounded-lg">
            <div className="flex items-center gap-x-3">
              <span className="bg-white dark:bg-darkblack-600 w-10 h-10 rounded-lg inline-flex justify-center items-center">
                {/* An icon, e.g. a contract icon, or PDF icon */}
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
                  Comisiones.csv
                </h5>
                <span className="text-xs text-bgray-500" onClick={() => downloadCSV("commissions_csv")}>Click para descargar</span>
              </div>
            </div>
            <button
              aria-label="Descargar Comisiones"
              onClick={() => downloadCSV("commissions_csv")}
            >
              <svg
                className="stroke-bgray-900 dark:stroke-bgray-50"
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
          </li>

          {/* Flujo Ingreso.csv => total_revenue_csv */}
          <li className="bg-[#E4FDED] dark:bg-darkblack-500 py-3 px-2 pr-4 flex justify-between items-center rounded-lg">
            <div className="flex items-center gap-x-3">
              <span className="bg-white dark:bg-darkblack-600 w-10 h-10 rounded-lg inline-flex justify-center items-center">
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
                  Flujo Ingreso.csv
                </h5>
                <span className="text-xs text-bgray-500" onClick={() => downloadCSV("total_revenue_csv")}>Click para descargar</span>
              </div>
            </div>
            <button
              aria-label="Descargar Flujo Ingreso"
              onClick={() => downloadCSV("total_revenue_csv")}
            >
              <svg
                className="stroke-bgray-900 dark:stroke-bgray-50"
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
          </li>

          {/* Morosidad.csv => overdue_payments_csv */}
          <li className="bg-[#E4FDED] dark:bg-darkblack-500 py-3 px-2 pr-4 flex justify-between items-center rounded-lg">
            <div className="flex items-center gap-x-3">
              <span className="bg-white dark:bg-darkblack-600 w-10 h-10 rounded-lg inline-flex justify-center items-center">
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
                  Morosidad.csv
                </h5>
                <span className="text-xs text-bgray-500" onClick={() => downloadCSV("overdue_payments_csv")}>Click para descargar</span>
              </div>
            </div>
            <button
              aria-label="Descargar Morosidad"
              onClick={() => downloadCSV("overdue_payments_csv")}
            >
              <svg
                className="stroke-bgray-900 dark:stroke-bgray-50"
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
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Report;