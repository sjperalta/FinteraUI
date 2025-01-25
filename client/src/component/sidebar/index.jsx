import PropTypes from "prop-types";
import bg from "../../assets/images/bg/upgrade-bg.png";
import logo from "../../assets/images/logo/logo-color.svg";
import logoW from "../../assets/images/logo/logo-white.svg";
import profileImg from "../../assets/images/avatar/profile-xs.png";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Sidebar({ handleActive, user }) {
  const [activeDashboard, setActiveDashboard] = useState(false);
  const { pathname: location } = useLocation();

  // A small helper to check user role
  const isAdmin = user.role === "admin";
  const isSeller = user.role === "seller";
  const isUser = user.role === "user";

  return (
    <aside className="sidebar-wrapper fixed top-0 z-30 block h-full w-[308px] bg-white dark:bg-darkblack-600 sm:hidden xl:block">
      {/* Header */}
      <div className="sidebar-header relative z-30 flex h-[108px] w-full items-center border-b border-r border-b-[#F7F7F7] border-r-[#F7F7F7] pl-[50px] dark:border-darkblack-400">
        <Link to="/">
          <img src={logo} className="block dark:hidden" alt="logo" />
          <img src={logoW} className="hidden dark:block" alt="logo" />
        </Link>
        <button
          aria-label="none"
          type="button"
          onClick={handleActive}
          className="drawer-btn absolute right-0 top-auto"
          title="Ctrl+b"
        >
          <span>
            <svg
              width="16"
              height="40"
              viewBox="0 0 16 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 10C0 4.47715 4.47715 0 10 0H16V40H10C4.47715 40 0 35.5228 0 30V10Z"
                fill="#22C55E"
              />
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
      </div>

      {/* Body */}
      <div className="sidebar-body overflow-style-none relative z-30 h-screen w-full overflow-y-scroll pb-[200px] pl-[48px] pt-[14px]">
        <div className="nav-wrapper mb-[36px] pr-[50px]">
          {/* Menu */}
          <div className="item-wrapper mb-5">
            <h4 className="border-b border-bgray-200 text-sm font-medium leading-7 text-bgray-700 dark:border-darkblack-400 dark:text-bgray-50">
              Menu
            </h4>
            <ul className="mt-2.5">
              {/* Dashboard: Only Admin */}
              {isAdmin && (
                <li
                  className={`item py-[11px] text-bgray-900 dark:text-white ${
                    location === "/" ? "nav-active" : ""
                  }`}
                >
                  <Link to="/">
                    <div className="flex items-center space-x-2.5">
                      <svg
                        width="18"
                        height="21"
                        viewBox="0 0 18 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 8.84719C0 7.99027 0.366443 7.17426 1.00691 6.60496L6.34255 1.86217C7.85809 0.515019 10.1419 0.515019 11.6575 1.86217L16.9931 6.60496C17.6336 7.17426 18 7.99027 18 8.84719V17C18 19.2091 16.2091 21 14 21H4C1.79086 21 0 19.2091 0 17V8.84719Z"
                          fill="#1A202C"
                        />
                        <path
                          d="M5 17C5 14.7909 6.79086 13 9 13C11.2091 13 13 14.7909 13 17V21H5V17Z"
                          fill="#22C55E"
                        />
                      </svg>
                      <span className="item-text text-lg font-medium leading-none">
                        Dashboard
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Balance: All roles */}
              {(isAdmin || isSeller || isUser) && (
                <li
                  className={`item py-[11px] text-bgray-900 dark:text-white ${
                    location === "/balance" ? "nav-active" : ""
                  }`}
                >
                  <Link to={`/balance/user/${user.id}`}>
                    <div className="flex items-center space-x-2.5">
                      <svg
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        width="24"
                        height="24"
                      >
                        <path
                          fill="currentColor"
                          d="M2 14h14v2H0V0h2zm2.5-1a1.5 1.5 0 11.131-2.994l1.612-2.687a1.5 1.5 0 112.514 0l1.612 2.687a1.42 1.42 0 01.23-.002l2.662-4.658a1.5 1.5 0 111.14.651l-2.662 4.658a1.5 1.5 0 11-2.496.026L7.631 7.994a1.42 1.42 0 01-.262 0l-1.612 2.687A1.5 1.5 0 014.5 13z"
                        />
                      </svg>
                      <span className="item-text text-lg font-medium leading-none">
                        Balance
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Transactions: Only Admin */}
              {isAdmin && (
                <li
                  className={`item py-[11px] text-bgray-900 dark:text-white ${
                    location === "/transaction" ? "nav-active" : ""
                  }`}
                >
                  <Link to="/transaction">
                    <div className="flex items-center space-x-2.5">
                      <span className="item-ico">
                        <svg
                          width="18"
                          height="20"
                          viewBox="0 0 18 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 16V6C18 3.79086 16.2091 2 14 2H4C1.79086 2 0 3.79086 0 6V16C0 18.2091 1.79086 20 4 20H14C16.2091 20 18 18.2091 18 16Z"
                            fill="#1A202C"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.25 8C4.25 7.58579 4.58579 7.25 5 7.25H13C13.4142 7.25 13.75 7.58579 13.75 8C13.75 8.41421 13.4142 8.75 13 8.75H5C4.58579 8.75 4.25 8.41421 4.25 8Z"
                            fill="#22C55E"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H13C13.4142 11.25 13.75 11.5858 13.75 12C13.75 12.4142 13.4142 12.75 13 12.75H5C4.58579 12.75 4.25 12.4142 4.25 12Z"
                            fill="#22C55E"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.25 16C4.25 15.5858 4.58579 15.25 5 15.25H9C9.41421 15.25 9.75 15.5858 9.75 16C9.75 16.4142 9.41421 16.75 9 16.75H5C4.58579 16.75 4.25 16.4142 4.25 16Z"
                            fill="#22C55E"
                          />
                          <path
                            d="M11 0H7C5.89543 0 5 0.895431 5 2C5 3.10457 5.89543 4 7 4H11C12.1046 4 13 3.10457 13 2C13 0.895431 12.1046 0 11 0Z"
                            fill="#22C55E"
                          />
                        </svg>
                      </span>
                      <span className="item-text text-lg font-medium leading-none">
                        Transacciones
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Contracts: Admin or Seller */}
              {(isAdmin || isSeller) && (
                <li
                  className={`item py-[11px] text-bgray-900 dark:text-white ${
                    location === "/contracts" ? "nav-active" : ""
                  }`}
                >
                  <Link to="/contracts">
                    <div className="flex items-center space-x-2.5">
                      <span className="item-ico">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"
                            fill="#1A202C"
                          />
                          <path
                            d="M14 9C12.8954 9 12 9.89543 12 11L12 13C12 14.1046 12.8954 15 14 15C15.1046 15 16 14.1046 16 13V11C16 9.89543 15.1046 9 14 9Z"
                            fill="#22C55E"
                          />
                          <path
                            d="M6 5C4.89543 5 4 5.89543 4 7L4 13C4 14.1046 4.89543 15 6 15C7.10457 15 8 14.1046 8 13L8 7C8 5.89543 7.10457 5 6 5Z"
                            fill="#22C55E"
                          />
                        </svg>
                      </span>
                      <span className="item-text text-lg font-medium leading-none">
                        Contratos
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Projects: Admin or Seller */}
              {(isAdmin || isSeller) && (
                <li
                  className={`item py-[11px] text-bgray-900 dark:text-white ${
                    location === "/projects" ? "nav-active" : ""
                  }`}
                >
                  <Link to="/projects">
                    <div className="flex items-center space-x-2.5">
                      <span className="item-ico">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.57666 3.61499C1.57666 2.51042 2.47209 1.61499 3.57666 1.61499H8.5C9.60456 1.61499 10.5 2.51042 10.5 3.61499V8.53833C10.5 9.64289 9.60456 10.5383 8.49999 10.5383H3.57666C2.47209 10.5383 1.57666 9.64289 1.57666 8.53832V3.61499Z"
                            fill="#1A202C"
                          />
                          <path
                            d="M13.5 15.5383C13.5 14.4338 14.3954 13.5383 15.5 13.5383H20.4233C21.5279 13.5383 22.4233 14.4338 22.4233 15.5383V20.4617C22.4233 21.5662 21.5279 22.4617 20.4233 22.4617H15.5C14.3954 22.4617 13.5 21.5662 13.5 20.4617V15.5383Z"
                            fill="#1A202C"
                          />
                          <circle
                            cx="6.03832"
                            cy="18"
                            r="4.46166"
                            fill="#1A202C"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18 2C18.4142 2 18.75 2.33579 18.75 2.75V5.25H21.25C21.6642 5.25 22 5.58579 22 6C22 6.41421 21.6642 6.75 21.25 6.75H18.75V9.25C18.75 9.66421 18.4142 10 18 10C17.5858 10 17.25 9.66421 17.25 9.25V6.75H14.75C14.3358 6.75 14 6.41421 14 6C14 5.58579 14.3358 5.25 14.75 5.25H17.25V2.75C17.25 2.33579 17.5858 2 18 2Z"
                            fill="#22C55E"
                          />
                        </svg>
                      </span>
                      <span className="item-text text-lg font-medium leading-none">
                        Proyectos
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Users: Admin or Seller */}
              {(isAdmin || isSeller) && (
                <li
                  className={`item py-[11px] text-bgray-900 dark:text-white ${
                    location === "/users" ? "nav-active" : ""
                  }`}
                >
                  <Link to="/users">
                    <div className="flex items-center space-x-2.5">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="11.7778"
                          cy="17.5555"
                          rx="7.77778"
                          ry="4.44444"
                          fill="#1A202C"
                        />
                        <circle
                          cx="11.7778"
                          cy="6.44444"
                          r="4.44444"
                          fill="#22C55E"
                        />
                      </svg>
                      <span className="item-text text-lg font-medium leading-none">
                        Usuarios
                      </span>
                    </div>
                  </Link>
                </li>
              )}

              {/* Audits: Only Admin */}
              {isAdmin && (
                <li
                  className={`item py-[11px] text-bgray-900 dark:text-white ${
                    location === "/history" ? "nav-active" : ""
                  }`}
                >
                  <Link to="/audits">
                    <div className="flex items-center space-x-2.5">
                      <svg
                        width="18"
                        height="21"
                        viewBox="0 0 18 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.5 12.5C17.5 17.1944 13.6944 21 9 21C4.30558 21 0.5 17.1944 0.5 12.5C0.5 7.80558 4.30558 4 9 4C13.6944 4 17.5 7.80558 17.5 12.5Z"
                          fill="#1A202C"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.99995 1.75C8.02962 1.75 7.09197 1.88462 6.20407 2.13575C5.80549 2.24849 5.39099 2.01676 5.27826 1.61818C5.16553 1.21961 5.39725 0.805108 5.79583 0.692376C6.81525 0.404046 7.89023 0.25 8.99995 0.25C10.1097 0.25 11.1846 0.404046 12.2041 0.692376C12.6026 0.805108 12.8344 1.21961 12.7216 1.61818C12.6089 2.01676 12.1944 2.24849 11.7958 2.13575C10.9079 1.88462 9.97028 1.75 8.99995 1.75Z"
                          fill="#22C55E"
                        />
                        <path
                          d="M11 13C11 14.1046 10.1046 15 9 15C7.89543 15 7 14.1046 7 13C7 11.8954 7.89543 11 9 11C10.1046 11 11 11.8954 11 13Z"
                          fill="#22C55E"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9 7.25C9.41421 7.25 9.75 7.58579 9.75 8V12C9.75 12.4142 9.41421 12.75 9 12.75C8.58579 12.75 8.25 12.4142 8.25 12V8C8.25 7.58579 8.58579 7.25 9 7.25Z"
                          fill="#22C55E"
                        />
                      </svg>
                      <span className="item-text text-lg font-medium leading-none">
                        Auditoria
                      </span>
                    </div>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Others */}
          <div className="item-wrapper mb-5">
            <h4 className="border-b border-bgray-200 text-sm font-medium leading-7 text-bgray-700 dark:border-darkblack-400 dark:text-bgray-50">
              Others
            </h4>
            <ul className="mt-2.5">
              {/* Signin: All roles can see or you can hide if already signed in */}
              <li
                className={`item py-[11px] text-bgray-900 dark:text-white ${
                  location === "/signin" ? "nav-active" : ""
                }`}
              >
                <Link to="/signin">
                  <div className="flex items-center space-x-2.5">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <ellipse
                        cx="11.7778"
                        cy="17.5555"
                        rx="7.77778"
                        ry="4.44444"
                        fill="#1A202C"
                      />
                      <circle
                        cx="11.7778"
                        cy="6.44444"
                        r="4.44444"
                        fill="#22C55E"
                      />
                    </svg>
                    <span className="item-text text-lg font-medium leading-none">
                      Signin
                    </span>
                  </div>
                </Link>
              </li>

              {/* Logout */}
              <li className={`item py-[11px] text-bgray-900 dark:text-white`}>
                <Link to="#">
                  <div className="flex items-center space-x-2.5">
                    <svg
                      width="21"
                      height="18"
                      viewBox="0 0 21 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M17.1464 10.4394C16.8536 10.7323 16.8536 11.2072 17.1464 11.5001C17.4393 11.7929 17.9142 11.7929 18.2071 11.5001L19.5 10.2072C20.1834 9.52375 20.1834 8.41571 19.5 7.73229L18.2071 6.4394C17.9142 6.1465 17.4393 6.1465 17.1464 6.4394C16.8536 6.73229 16.8536 7.20716 17.1464 7.50006L17.8661 8.21973H11.75C11.3358 8.21973 11 8.55551 11 8.96973C11 9.38394 11.3358 9.71973 11.75 9.71973H17.8661L17.1464 10.4394Z"
                        fill="#22C55E"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.75 17.75H12C14.6234 17.75 16.75 15.6234 16.75 13C16.75 12.5858 16.4142 12.25 16 12.25C15.5858 12.25 15.25 12.5858 15.25 13C15.25 14.7949 13.7949 16.25 12 16.25H8.21412C7.34758 17.1733 6.11614 17.75 4.75 17.75ZM8.21412 1.75H12C13.7949 1.75 15.25 3.20507 15.25 5C15.25 5.41421 15.5858 5.75 16 5.75C16.4142 5.75 16.75 5.41421 16.75 5C16.75 2.37665 14.6234 0.25 12 0.25H4.75C6.11614 0.25 7.34758 0.82673 8.21412 1.75Z"
                        fill="#1A202C"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 5C0 2.37665 2.12665 0.25 4.75 0.25C7.37335 0.25 9.5 2.37665 9.5 5V13C9.5 15.6234 7.37335 17.75 4.75 17.75C2.12665 17.75 0 15.6234 0 13V5Z"
                        fill="#1A202C"
                      />
                    </svg>
                    <span className="item-text text-lg font-medium leading-none">
                      Logout
                    </span>
                  </div>
                </Link>
              </li>

              {/* Landing Page */}
              <li>
                <Link
                  to="/home-5"
                  className={`text-md inline-block py-1.5 font-medium text-bgray-600 transition-all hover:text-bgray-800 dark:text-bgray-50 hover:dark:text-success-300 ${
                    location === "/home-5" ? "nav-active" : ""
                  }`}
                >
                  Landing Page
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Footer */}
        <div className="copy-write-text">
          <p className="text-sm text-[#969BA0]">© 2023 All Rights Reserved</p>
          <p className="text-sm font-medium text-bgray-700">
            Made by
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="border-b font-semibold hover:text-blue-600 ml-1"
            >
              Grintsys
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  handleActive: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default Sidebar;