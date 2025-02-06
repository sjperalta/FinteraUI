import { useState } from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import { API_URL } from "../../../config";
import inbox1 from "../../assets/images/avatar/profile.png";

function UserData({ userInfo, index, token, onClick}) {
  const { id, full_name, phone, email, status: initialStatus, role } = userInfo;
  const [status, setStatus] = useState(initialStatus); // Use local state for status

  const toggleUserStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${id}/toggle_status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Incluye el token en los headers
        },
      });

      if (!response.ok) {
        throw new Error('Error toggling user status');
      }

      setStatus((prevStatus) => (prevStatus === "active" ? "inactive" : "active"));
      console.log('User status toggled successfully');
      //window.location.reload(); // Recargar la página para reflejar el cambio
      //comentado porque la paguina no soporte refresh, esto va a eliminar el local storage
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <tr className={index % 2 === 0 ? "bg-white dark:bg-darkblack-600 hover:bg-success-50" : "hover:bg-success-50"} onClick={onClick}>
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
            <h4 className="font-bold text-lg text-bgray-900 dark:text-white">
              {full_name}#{id}
            </h4>
            <div>
              <span className="font-medium text-base text-bgray-700 dark:text-bgray-50">
                {email} • {" "}
              </span>
              <span className="text-gray-500">{phone}•</span>{" "}
              <span className="text-gray-500">{role}</span>
            </div>
          </div>
        </div>
      </td>
      <div>
         
      </div>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-5">
          <input
              className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
              type="checkbox"
              checked={status === 'active'}
              onChange={toggleUserStatus} // Cambia el estado cuando el toggle cambia
              role="switch"
              id={`flexSwitchCheckDefault-${id}`} />
          <label
              className="inline-block pl-[0.15rem] hover:cursor-pointerml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
              htmlFor="flexSwitchCheckDefault"
          >{status}</label>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-5">
          <Link
            to={`/settings/user/${id}`}
            className="text-sm font-medium text-success-300"
          >
            Editar
          </Link>
          <button
            onClick={resendConfirmation}
            className="text-sm font-medium text-success-300"
          >
            Invitar
          </button>
          <Link
            to="/home-2"
            className="text-sm font-medium text-success-300"
          >
            Estado de Cuenta
          </Link>
        </div>
      </td>
      <td className="whitespace-nowrap pr-3 py-4 text-sm text-gray-500 rounded-r-lg">
        <button aria-label="none" className="">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}

UserData.propTypes = {
  userInfo: ProtoTypes.object,
  index: ProtoTypes.number,
};

export default UserData;
