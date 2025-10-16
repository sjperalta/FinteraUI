import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";
import { API_URL } from "../../../config";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils";

function UserData({ userInfo, index, token, onClick, isMobileCard = false }) {
  const { t } = useLocale();
  const { id, full_name, phone, email, status: initialStatus, role, created_at, created_by, creator } = userInfo;
  const [status, setStatus] = useState(initialStatus); // Use local state for status

  const toggleUserStatus = async () => {
    if (!token) {
      console.warn("toggleUserStatus: missing token");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${id}/toggle_status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error toggling user status");
      }
      setStatus((prevStatus) => (prevStatus === "active" ? "inactive" : "active"));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resendConfirmation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${id}/resend_confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error resending confirmation email');
      }

      alert('Confirmation email sent successfully');
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to send confirmation email: ${error.message}`);
    }
  };

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "-";

  // Use backend-provided creator.full_name when available; otherwise show placeholder
  const creatorLabel = creator?.full_name || "—";

  // Mobile Card View
  if (isMobileCard) {
    return (
      <div className="bg-white dark:bg-darkblack-600 rounded-lg border border-gray-200 dark:border-darkblack-400 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar with Initials */}
          <div className="relative group flex-shrink-0">
            <div className={`w-16 h-16 rounded-full ${getAvatarColor(full_name)} flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-darkblack-600`}>
              <span className="text-white font-bold text-xl tracking-tight">
                {getInitials(full_name)}
              </span>
            </div>
            {/* Status indicator dot */}
            <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-darkblack-600 ${
              status === "active" ? "bg-green-500" : "bg-gray-400"
            }`}></div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Name and ID */}
            <h4 className="font-bold text-lg text-bgray-900 dark:text-white mb-1">
              {full_name}
            </h4>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              #{id}
            </span>
          </div>
          
          {/* Role badge */}
          <span
            className={
              "text-xs font-semibold px-3 py-1.5 rounded-full " +
              (role === "admin"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : role === "seller"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400")
            }
          >
            {role}
          </span>
        </div>

        {/* User details */}
        <div className="space-y-3 mb-4">
          {/* Email */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {email}
            </span>
          </div>
          
          {/* Created date */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('users.created')}: {formattedDate}
            </span>
          </div>
          
          {/* Created by */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('users.createdBy')}: <span className="font-medium text-gray-600 dark:text-gray-300">{creatorLabel}</span>
            </span>
          </div>
        </div>

        {/* Status toggle */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-darkblack-500 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.status')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleUserStatus();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                status === "active" 
                  ? "bg-green-500" 
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  status === "active" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${
              status === "active" 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-500 dark:text-gray-400"
            }`}>
              {status === "active" ? t('common.active') : t('common.inactive')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={`/settings/user/${id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('common.edit')}
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resendConfirmation();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
            {t('users.invite')}
          </button>
        </div>
      </div>
    );
  }

  // Desktop Table Row View
  return (
    <>
      <td className="px-6 py-5 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {/* Avatar with Initials */}
          <div className="relative group flex-shrink-0">
            <div className={`w-14 h-14 rounded-full ${getAvatarColor(full_name)} flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-darkblack-600 transform transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl`}>
              <span className="text-white font-bold text-lg tracking-tight">
                {getInitials(full_name)}
              </span>
            </div>
            {/* Status indicator dot */}
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-darkblack-600 ${
              status === "active" ? "bg-green-500" : "bg-gray-400"
            }`}></div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Top row: name + role badge */}
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-bold text-base text-bgray-900 dark:text-white truncate">
                {full_name}
              </h4>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                #{id}
              </span>
              <span
                className={
                  "text-xs font-semibold px-2.5 py-1 rounded-full " +
                  (role === "admin"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : role === "seller"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400")
                }
              >
                {role}
              </span>
            </div>

            {/* User details */}
            <div className="space-y-1.5">
              {/* Email */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {email}
                </span>
              </div>
              
              {/* Created date */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('users.created')}: {formattedDate}
                </span>
              </div>
              
              {/* Created by */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('users.createdBy')}: <span className="font-medium text-gray-600 dark:text-gray-300">{creatorLabel}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Status cell */}
      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleUserStatus();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              status === "active" 
                ? "bg-green-500" 
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                status === "active" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`ml-3 text-xs font-semibold ${
            status === "active" 
              ? "text-green-600 dark:text-green-400" 
              : "text-gray-500 dark:text-gray-400"
          }`}>
            {status === "active" ? t('common.active') : t('common.inactive')}
          </span>
        </div>
      </td>

      {/* Actions cell */}
      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
        <div className="flex items-center gap-3">
          <Link
            to={`/settings/user/${id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors font-medium text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('common.edit')}
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resendConfirmation();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg transition-colors font-medium text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
            {t('users.invite')}
          </button>
        </div>
      </td>
    </>
  );
}

UserData.propTypes = {
  userInfo: PropTypes.object.isRequired,
  index: PropTypes.number,
  token: PropTypes.string,
  onClick: PropTypes.func,
  isMobileCard: PropTypes.bool,
};

export default UserData;
