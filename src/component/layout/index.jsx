import ProtoTypes from "prop-types";
import Sidebar from "../sidebar";
import Overlay from "../overlay";
import SidebarV2 from "../sidebar/SidebarV2";
import HeaderOne from "../header/HeaderOne";
import HeaderTwo from "../header/HeaderTwo";
import { useContext, useState } from "react";
import { createContext } from "react";
import { Outlet } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

export const ThemeContext = createContext({ theme: "", setTheme: () => {} });

function Layout({ bg, overlay, children }) {
  const { user, logout } = useContext(AuthContext);
  const [sidebar, setSidebar] = useState(true);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") === "" || localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : ""
  );

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div
        className={`layout-wrapper ${
          sidebar && "active"
        }  w-full dark:bg-darkblack-600 `}
        style={{
          borderColor: "#2a313c",
        }}
      >
        <div className="relative flex w-full">
          {user ? <Sidebar handleActive={() => setSidebar(!sidebar)} user={user}  handleLogout={handleLogout} /> : <div>Sidebar render ...</div>}
          {overlay ? overlay : <Overlay />}
          {user ? <SidebarV2 user={user} handleLogout={handleLogout} /> : <div>Sidebar render ...</div>}
          <div
            className={`body-wrapper flex-1 overflow-x-hidden ${
              bg ? bg : "dark:bg-darkblack-500"
            } `}
          >
            <HeaderOne handleSidebar={() => setSidebar(!sidebar)} />
            <HeaderTwo handleSidebar={() => setSidebar(!sidebar)} />
            <Outlet />
            {children}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

Layout.propTypes = {
  bg: ProtoTypes.string,
  overlay: ProtoTypes.node,
  children: ProtoTypes.node,
};

export default Layout;
