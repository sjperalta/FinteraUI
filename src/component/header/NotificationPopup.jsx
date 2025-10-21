import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";

function NotificationPopup({ active, loading, notifications, onMarkAllAsRead }) {
  const { t } = useLocale();

  return (
    <div className="notification-popup-wrapper text-left">
      <div
        id="notification-box"
        style={{
          filter: `drop-shadow(12px 12px 40px rgba(0, 0, 0, 0.08))`,
        }}
        className={`absolute right-[0px] top-[81px] w-[400px] transition-all origin-top rounded-lg bg-white dark:bg-darkblack-600 z-20 ${
          active ? "block introAnimation" : "hidden"
        }`}
      >
        <div className="relative w-full">
          {/* Header - Fixed at top */}
          <div className="flex h-[66px] w-full items-center justify-between px-8 border-b border-bgray-200 dark:border-darkblack-400">
            <h3 className="text-xl font-bold text-bgray-900 dark:text-white">
              {t("notifications.title")}
            </h3>
            {/* Optional: an icon or close button */}
            <span>
              <svg
                className="stroke-darkblack-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6L18 18M6 18L18 6L6 18Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          {/* Tab section */}
          <div className="flex items-center border-b border-bgray-200 dark:border-darkblack-400">
            <button
              aria-label="none"
              type="button"
              className="flex space-x-2 border-b-2 border-success-300 px-6 py-4 text-sm font-semibold capitalize text-success-300"
            >
              <span>{t("notifications.all")}</span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-50 text-[10px] text-success-300">
                {notifications.length}
              </span>
            </button>
          </div>

          {/* Notification List - Scrollable area */}
          <ul className="max-h-[400px] w-full overflow-y-auto scroll-style-1">
            {loading && (
              <li className="py-4 pl-6 pr-[50px] text-sm text-bgray-600 dark:text-bgray-50">
                {t("notifications.loading")}
              </li>
            )}

            {!loading && notifications.length === 0 && (
              <li className="py-4 pl-6 pr-[50px] text-sm text-bgray-600 dark:text-bgray-50">
                {t("notifications.noNotifications")}
              </li>
            )}

            {!loading &&
              notifications.map((n) => (
                <li
                  key={n.id}
                  className="border-b border-bgray-200 py-4 pl-6 pr-[50px] hover:bg-bgray-100 dark:border-darkblack-400 dark:hover:bg-darkblack-500 transition-colors duration-150"
                >
                  <Link to="#">
                    <div className="noti-item">
                      {/* Show the title if present */}
                      {n.title && (
                        <strong className="text-bgray-900 dark:text-white block">
                          {n.title}
                        </strong>
                      )}
                      <p className="mb-1 text-sm font-medium text-bgray-600 dark:text-bgray-50">
                        {n.message}
                      </p>
                      <span className="text-xs font-medium text-bgray-500">
                        {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>

          {/* Footer Action - Fixed at bottom */}
          <div className="flex h-[75px] w-full items-center justify-between px-8 bg-white dark:bg-darkblack-600 border-t border-bgray-200 dark:border-darkblack-400">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAllAsRead();
              }}
              disabled={notifications.length === 0}
              className="flex items-center space-x-2 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
            >
              <span>
                <svg
                  width="22"
                  height="12"
                  viewBox="0 0 22 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-150 group-hover:translate-x-1"
                >
                  <path
                    d="M6 6L11 11L21 1M1 6L6 11M11 6L16 1"
                    stroke="#0CAF60"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm font-semibold text-success-300 group-hover:text-success-400 transition-colors duration-150">
                {t("notifications.markAllAsRead")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

NotificationPopup.propTypes = {
  active: PropTypes.bool,
  loading: PropTypes.bool,
  notifications: PropTypes.array,
  onMarkAllAsRead: PropTypes.func.isRequired,
};

export default NotificationPopup;