import { useState, useEffect, useContext } from "react";
import { API_URL } from "../../../config";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Toast from "../ui/Toast";
import { useLocale } from "../../contexts/LocaleContext";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils";

function RightSidebar({ user, onClose, currentUser }) {
  const { t } = useLocale();
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const { token, user: loggedUser } = useContext(AuthContext);
  const viewer = currentUser || loggedUser;

  // Minimal guard: don't attempt to render sidebar when no user provided
  if (!user) return null;


  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    // do not fetch for admin/seller accounts
    if (user?.role === "admin" || user?.role === "seller") return;

    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/users/${userId}/summary`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        }
        const data = await response.json();
        // minimal debug to confirm fetch ran
        // console.debug("fetched user summary", userId, data);
        setSummary(data);
      } catch (error) {
        console.error(error);
        setSummaryError("Error loading balance");
      }
    };

    fetchSummary();
  }, [user?.id, user?.role, token]);

  // Function to Download PDF
  const downloadUserBalancePDF = async () => {
    if (!user || !user.id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/reports/user_balance_pdf?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      setToast({ visible: true, message: "Failed to download PDF", type: "error" });
    }
  };

  return (
    <aside className="2xl:w-[400px] w-full bg-white dark:bg-darkblack-600 rounded-2xl shadow-xl px-8 pb-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5"></div>
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-darkblack-500 transition-all p-2 rounded-full"
        aria-label="Close sidebar"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <header className="flex flex-col items-center text-center pt-8 pb-6 relative">
        {/* Avatar with Initials */}
        <div className={`w-28 h-28 rounded-2xl ${getAvatarColor(user.full_name)} flex items-center justify-center shadow-2xl relative z-10 ring-4 ring-white dark:ring-darkblack-600`}>
          <span className="text-white font-bold text-4xl">
            {getInitials(user.full_name)}
          </span>
        </div>
        
        <div className="flex flex-col items-center mt-5 space-y-2">
          <h3 className="text-2xl font-bold text-bgray-900 dark:text-white">
            {user.full_name}
          </h3>
          
          <span
            className={
              `text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide ` +
              (user?.role === "admin"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : user?.role === "seller"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400")
            }
          >
            {user?.role}
          </span>
          
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {summary?.contractList || t('contracts.noContracts')}
          </p>
        </div>

        {/* Address with icon */}
        {user.address && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-darkblack-500 px-4 py-2 rounded-lg">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{user.address}</span>
          </div>
        )}
      </header>

      {/* User Details Section */}
      <div className="bg-gray-50 dark:bg-darkblack-500 rounded-xl p-5 space-y-4 mb-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          {t('contracts.contactInformation')}
        </h4>
        
        <div className="flex items-start gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t('personalInfo.email')}</p>
            <p className="text-sm font-semibold text-bgray-900 dark:text-white truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t('personalInfo.phone')}</p>
            <p className="text-sm font-semibold text-bgray-900 dark:text-white">{user.phone || "-"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t('personalInfo.identity')}</p>
            <p className="text-sm font-semibold text-bgray-900 dark:text-white">{user.identity || "-"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t('personalInfo.rtn')}</p>
            <p className="text-sm font-semibold text-bgray-900 dark:text-white">{user.rtn || "-"}</p>
          </div>
        </div>
      </div>

      {/* Financial & Additional Info Section */}
      {(user?.role === "user" && 
        (viewer?.role === "admin" || 
         String(viewer?.id) === String(user?.id) || 
         String(viewer?.id) === String(user?.created_by))) && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-5 mb-5 border border-green-100 dark:border-green-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('contracts.balance')}</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {summary
                    ? `${(Number(summary.balance) || 0).toLocaleString()} ${summary.currency}`
                    : summaryError || t('common.loading')}
                </p>
              </div>
            </div>
            <Link 
              to={`/financing/user/${user.id}`}
              className="p-2 bg-white dark:bg-darkblack-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 14h14v2H0V0h2zm2.5-1a1.5 1.5 0 11.131-2.994l1.612-2.687a1.5 1.5 0 112.514 0l1.612 2.687a1.42 1.42 0 01.23-.002l2.662-4.658a1.5 1.5 0 111.14.651l-2.662 4.658a1.5 1.5 0 11-2.496.026L7.631 7.994a1.42 1.42 0 01-.262 0l-1.612 2.687A1.5 1.5 0 014.5 13z" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {user?.note && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4 mb-5 border border-yellow-200 dark:border-yellow-900/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">{t('contracts.note')}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{user.note}</p>
            </div>
          </div>
        </div>
      )}

      {/* Created By Section */}
      {user?.created_by && (
        <div className="bg-gray-50 dark:bg-darkblack-500 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('users.createdBy')}</p>
              <p className="text-sm font-semibold text-bgray-900 dark:text-white">{user.creator?.full_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Download Section */}
      {user?.role === "user" &&
      (viewer?.role === "admin" ||
        String(viewer?.id) === String(user?.id) ||
        String(viewer?.id) === String(user?.created_by)) && (
        <div className="bg-white dark:bg-darkblack-600 rounded-xl p-5 border border-gray-200 dark:border-darkblack-400">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {t('contracts.documents')}
            </h4>
          </div>
          
          <button
            onClick={downloadUserBalancePDF}
            className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 border border-green-200 dark:border-green-900/40 rounded-xl p-4 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-darkblack-500 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  Estado de Cuenta.pdf
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('contracts.accountStatement')}
                </p>
              </div>
            </div>
            
            <div className="w-9 h-9 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-700 dark:group-hover:bg-green-600 transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
          </button>
        </div>
      )}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((s) => ({ ...s, visible: false }))} />
    </aside>
  );
}

export default RightSidebar;
