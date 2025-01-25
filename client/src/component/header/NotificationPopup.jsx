import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { getToken } from "../../../auth"; // Example: adjust to your auth logic
import { API_URL } from "../../../config"; // Example: adjust to your config

function NotificationPopup({ active }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications whenever the popup becomes active
  useEffect(() => {
    if (active) {
      fetchNotifications();
    }
  }, [active]);

  // API call: GET /api/v1/notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/notifications`, {
        headers: {
          Authorization: `Bearer ${getToken()}`, // if needed
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await res.json();
      // Assuming data.notifications is an array
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // API call: POST /api/v1/notifications/mark_all_as_read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/notifications/mark_all_as_read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to mark all as read");
      }
      // After success, re-fetch the notifications to update the UI
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  return (
    <div className="notification-popup-wrapper text-left overflow-y-hidden">
      <div
        id="notification-box"
        style={{
          filter: `drop-shadow(12px 12px 40px rgba(0, 0, 0, 0.08))`,
        }}
        className={`absolute right-[0px] top-[81px] w-[400px] transition-all origin-top rounded-lg bg-white dark:bg-darkblack-600 overflow-y-hidden ${active ? "block introAnimation" : "hidden"
          }`}
      >
        <div className="relative w-full pb-[75px] pt-[66px] overflow-y-hidden">
          {/* Header */}
          <div className="absolute left-0 top-0 flex h-[66px] w-full items-center justify-between px-8">
            <h3 className="text-xl font-bold text-bgray-900 dark:text-white">
              Notificaciones
            </h3>
            {/* Optional: an icon or close button */}
            <span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* your icon path */}
                <path /* ... */ />
                <path /* ... */ />
              </svg>
            </span>
          </div>

          <div>
            <div class="flex items-center border-b border-bgray-200 dark:border-darkblack-400">
              <button aria-label="none" type="button" class="flex space-x-2 border-b-2 border-success-300 px-6 py-4 text-sm font-semibold capitalize text-success-300">
                <span>All</span>
                <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-50 text-[10px] text-success-300">{notifications.length}</span>
              </button>
            </div>
            {/* Notification List */}
            <ul className="scroll-style-1 h-[335px] w-full overflow-y-scroll ">
              {loading && (
                <li className="py-4 pl-6 pr-[50px] text-sm text-bgray-600 dark:text-bgray-50">
                  Cargando notificaciones...
                </li>
              )}

              {!loading && notifications.length === 0 && (
                <li className="py-4 pl-6 pr-[50px] text-sm text-bgray-600 dark:text-bgray-50">
                  No hay notificaciones
                </li>
              )}

              {!loading &&
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-bgray-200 py-4 pl-6 pr-[50px] hover:bg-bgray-100 dark:border-darkblack-400 dark:hover:bg-darkblack-500"
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
          </div>

          {/* Footer Action - Mark all as read */}
          <div className="absolute bottom-0 left-0 flex h-[75px] w-full items-center justify-between px-8">
            <div>
              <button onClick={handleMarkAllAsRead}>
                <div className="flex items-center space-x-2">
                  <span>
                    <svg
                      width="22"
                      height="12"
                      viewBox="0 0 22 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
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
                  <span className="text-sm font-semibold text-success-300">
                    Marcar Todo Como Leido
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

NotificationPopup.propTypes = {
  active: PropTypes.bool,
};

export default NotificationPopup;