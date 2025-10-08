import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";
import { API_URL } from "../../../config";
import inbox1 from "../../assets/images/avatar/profile.png";

function UserData({ userInfo, index, token, onClick}) {
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

  return (
    <tr
      className={`${index % 2 === 0 ? "bg-white dark:bg-darkblack-600" : ""} hover:bg-success-50 cursor-pointer`}
      onClick={() => onClick && onClick(userInfo)}
    >
      <td className="whitespace-nowrap py-4 text-sm text-gray-500 w-[400px] lg:w-auto">
        <div className="flex items-center gap-5">
          <div className="w-[64px] h-[64px]">
            <img
              className="w-full h-full object-cover rounded-lg"
              src={inbox1}
              alt=""
            />
          </div>
          <div className="flex-1">
            {/* Top row: name (left) + role badge (right) */}
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-lg text-bgray-900 dark:text-white">
                {full_name}#{id} <span
                className={
                  "text-sm font-medium px-3 py-1 rounded-full " +
                  (role === "admin"
                    ? "bg-success-300 text-white"
                    : role === "seller"
                    ? "bg-yellow-400 text-white"
                    : "bg-bgray-100 text-bgray-900 dark:bg-darkblack-500 dark:text-bgray-50")
                }
              >
                {role}
              </span>
              </h4>
             
            </div>

            {/* Second line: email + created_at (removed phone & duplicate role) */}
            <div className="mt-1">
              <div className="flex items-center gap-1 mb-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-base text-bgray-700 dark:text-bgray-50">
                  {email}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">
                  {t('users.created')}: {formattedDate}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-bgray-700 dark:text-bgray-50">{t('users.createdBy')}: </span>
                <span className="ml-1">{creatorLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Status cell */}
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={status === "active"}
            onChange={toggleUserStatus}
            role="switch"
            id={`flexSwitchCheckDefault-${id}`}
            className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem]"
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
            htmlFor={`flexSwitchCheckDefault-${id}`}
          >
            {status}
          </label>
        </div>
      </td>

      {/* Actions cell */}
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-5">
          <Link
            to={`/settings/user/${id}`}
            className="text-sm font-medium text-success-300"
          >
            {t('common.edit')}
          </Link>
          <button
            onClick={resendConfirmation}
            className="text-sm font-medium text-success-300"
          >
            {t('users.invite')}
          </button>
        </div>
      </td>
    </tr>
  );
}

UserData.propTypes = {
  userInfo: PropTypes.object,
  index: PropTypes.number,
};

export default UserData;
