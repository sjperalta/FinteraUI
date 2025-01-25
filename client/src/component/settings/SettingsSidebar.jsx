import ProtoTypes from "prop-types";
import Progressbar from "../chart/Progressbar";
import TabBtn from "../button/TabBtn";

function SettingsSidebar() {
  return (
    <aside className="col-span-3 border-r border-bgray-200 dark:border-darkblack-400">
      {/* Sidebar Tabs */}

      <div className="px-4 py-6">
        <TabBtn
          link=""
          title="Personal"
          text="Información General del usuario"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="12"
              cy="17.5"
              rx="7"
              ry="3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </TabBtn>
        <TabBtn
          link="security"
          title="Seguridad"
          text="Gestiona tu contraseña"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 8H8M16 8C18.2091 8 20 9.79086 20 12V18C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18V12C4 9.79086 5.79086 8 8 8M16 8V6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6V8M14 15C14 16.1046 13.1046 17 12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </TabBtn>
        <TabBtn
          link="terms&conditions"
          title="Terminos y condiciones"
          text="Información Legal de las condiciones de uso de la plataforma"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 14L10.7528 15.4023C11.1707 15.7366 11.7777 15.6826 12.1301 15.2799L15 12M16 4H17C19.2091 4 21 5.79086 21 8V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V8C3 5.79086 4.79086 4 7 4H8M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4"
              strokeWidth="1.5"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
        </TabBtn>
      </div>
      {/* Progressbar  */}
      <div className="px-8">
        <Progressbar className="bg-bgray-200 dark:bg-darkblack-500 p-7 rounded-xl" />
      </div>
    </aside>
  );
}

SettingsSidebar.propTypes = {
  activeTab: ProtoTypes.string,
  handleActiveTab: ProtoTypes.func,
};

export default SettingsSidebar;
