import { useState, useEffect, useContext } from "react";
import { API_URL } from "../../../config";
import AuthContext from "../../context/AuthContext";
import userImg from "../../assets/images/avatar/user-1.png";

function RightSidebar({ user, onClose }) {
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/${user.id}/summary`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        }
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error(error);
        setSummaryError("Error loading balance");
      }
    };

    fetchSummary();
  }, [user, token]);

  // Function to Download PDF
  const downloadUserBalancePDF = async () => {
    if (!user || !user.id) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/reports/user_balance_pdf?user_id=${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      // Convert the response into a blob and create a download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user_balance_${user.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF");
    }
  };

  return (
    <aside className="2xl:w-[382px] w-full bg-white dark:bg-darkblack-600 rounded-lg px-12 pb-7 relative">
      
      {/* ✅ Improved Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 dark:hover:text-white transition p-2 rounded-full"
        aria-label="Close sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <header className="flex flex-col items-center text-center -mt-8 pb-7">
        <img src={userImg} className="rounded-lg" alt="User avatar" />
        <h3 className="text-xl font-bold text-bgray-700 dark:text-white mt-4">
          {user.full_name}
        </h3>
        <p className="text-base font-medium text-bgray-500 dark:text-white">
          {summary?.contractList || "No Contracts"}
        </p>
      </header>

      <ul className="py-7 border-t border-b border-gray-200 dark:border-darkblack-400 space-y-6">
        <li className="flex justify-between">
          <span className="font-medium text-gray-500 text-sm dark:text-white">Correo</span>
          <span className="text-sm font-semibold text-bgray-900 dark:text-white">{user.email}</span>
        </li>
        <li className="flex justify-between">
          <span className="font-medium text-gray-500 text-sm dark:text-white">Teléfono</span>
          <span className="text-sm font-semibold text-bgray-900 dark:text-white">{user.phone}</span>
        </li>
        <li className="flex justify-between">
          <span className="font-medium text-gray-500 text-sm dark:text-white">Balance</span>
          <span className="text-sm font-semibold text-bgray-900 dark:text-white">
            {summary
              ? `${(Number(summary.balance) || 0).toLocaleString()} ${summary.currency}`
              : summaryError || "Loading..."}
          </span>
        </li>
      </ul>

      {/* File Download Section */}
      <div className="py-6 border-b border-bgray-200 dark:border-darkblack-400">
        <h4 className="font-medium text-gray-500 text-sm dark:text-white mb-3">Files</h4>
        <ul className="space-y-2.5">
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
                </svg>
              </span>
              <div className="flex flex-col">
                <h5 className="font-semibold text-bgray-900 dark:text-white text-sm">
                  Estado de Cuenta.pdf
                </h5>
                <span className="text-xs text-bgray-500">Download user balance report</span>
              </div>
            </div>
            {/* Download Button */}
            <button onClick={downloadUserBalancePDF} aria-label="Download PDF">
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

export default RightSidebar;
