// src/components/header/HeaderOne.jsx

import PropTypes from "prop-types";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import Author from "./Author";
import NotificationPopup from "./NotificationPopup";
import ProfilePopup from "./ProfilePopup";
import ToggleBtn from "./ToggleBtn";
import ModeToggler from "./ModeToggler";
import { API_URL } from "../../../config";   // <-- Example import
import { getToken } from "../../../auth";    // <-- For authentication token

const WELCOME_MESSAGES = [
  "¡Revisemos tus avances hoy!",
  "¡Bienvenido de nuevo! Esperamos que tengas un día productivo.",
  "¿Listo para alcanzar tus metas?",
  "¡Es hora de progresar con tus tareas!",
  "¡Esperamos que tengas un día fantástico!",
];

function HeaderOne({ handleSidebar }) {
  const [popup, setPopup] = useState(false);
  const navigate = useNavigate();

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  // Extract user, logout from AuthContext
  const { user, logout } = useContext(AuthContext);

  // Pick a random welcome message once
  const [welcomeMessage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
    return WELCOME_MESSAGES[randomIndex];
  });

  // On mount, fetch notifications if user is logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/notifications`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`, // if needed
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await res.json();
      // Expect data.notifications to be an array
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handlePopup = (name) => {
    setPopup((prevPopup) => ({
      [name]: !prevPopup?.[name],
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <header className="header-wrapper fixed z-30 hidden w-full md:block">
      <div className="relative flex h-[108px] w-full items-center justify-between bg-white px-10 dark:bg-darkblack-600 2xl:px-[76px]">
        {/* Sidebar Toggle Button */}
        <button
          aria-label="none"
          onClick={handleSidebar}
          title="Ctrl+b"
          type="button"
          className="drawer-btn absolute left-0 top-auto rotate-180 transform"
        >
          <span>
            <svg
              width="16"
              height="40"
              viewBox="0 0 16 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 10C0 4.47715 4.47715 0 10 0H16V40H10C4.47715 40 0 35.5228 0 30V10Z" fill="#22C55E" />
              <path
                d="M10 15L6 20.0049L10 25.0098"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {/* Page Title */}
        <div>
          <h3 className="text-xl font-bold text-bgray-900 dark:text-bgray-50 lg:text-3xl lg:leading-[36.4px]">
            Dashboard
          </h3>
          <p className="text-xs font-medium text-bgray-600 dark:text-bgray-50 lg:text-sm lg:leading-[25.2px]">
            {welcomeMessage}
          </p>
        </div>

        {/* Right Section: Notifications + Profile */}
        <div className="quick-access-wrapper relative">
          <div className="flex items-center space-x-[43px]">
            {/* Some hidden items + Toggles */}
            <div className="hidden items-center space-x-5 xl:flex">
              <div
                onClick={() => setPopup(false)}
                id="noti-outside"
                className={`fixed left-0 top-0 h-full w-full ${popup ? "block" : "hidden"}`}
              ></div>

              <ModeToggler />

              {/* Notification Toggle Button */}
              <ToggleBtn
                name="notification"
                clickHandler={handlePopup}
                icon={
                  <svg class="stroke-bgray-900 dark:stroke-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12V7C2 4.79086 3.79086 3 6 3H18C20.2091 3 22 4.79086 22 7V17C22 19.2091 20.2091 21 18 21H8M6 8L9.7812 10.5208C11.1248 11.4165 12.8752 11.4165 14.2188 10.5208L18 8M2 15H8M2 18H8" stroke-width="1.5" stroke-linecap="round"></path></svg>
                }
              >
                {/* Pass the notifications + active state to NotificationPopup */}
                <NotificationPopup
                  active={popup?.notification}
                  notifications={notifications}
                  // Example: You could pass a markAllAsRead function here if desired
                  // onMarkAllAsRead={handleMarkAllAsRead}
                />
              </ToggleBtn>
            </div>

            {/* Vertical Divider */}
            <div className="hidden h-[48px] w-[1px] bg-bgray-300 dark:bg-darkblack-400 xl:block"></div>

            {/* User Profile */}
            {user ? (
              <Author showProfile={handlePopup} user={user} />
            ) : (
              <div>Por favor inicia sesión</div>
            )}
          </div>

          {/* Profile Popup */}
          {user && (
            <ProfilePopup
              active={popup?.profile}
              handlePopup={handlePopup}
              user={user}
              handleLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}

HeaderOne.propTypes = {
  handleSidebar: PropTypes.func,
};

export default HeaderOne;