// src/component/listTab/lots/LotInfo.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";
import { formatStatus } from "../../../utils/formatStatus"; // Ensure this path is correct

/**
 * This component displays a single lot row.
 * It includes:
 * - "Reservar" link, which redirects to create a contract
 * - "Cancelar" button, which calls an API to cancel an existing contract
 * - "Rechazar" button for admin, which calls an API to reject the contract
 */
function LotInfo({
  project_name,
  name,
  dimensions,
  balance,
  reserved_by,
  status,
  project_id,
  lot_id,
  contract_id,
  userRole,
  refreshLots,
  measurement_unit,   // new optional
  area,               // new optional
}) {
  const token = getToken();

  // CANCEL endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/cancel
  const handleCancel = async () => {
    if (!contract_id) {
      alert("No contract_id available to cancel reservation.");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}/contracts/${contract_id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error canceling the reservation");
      }
      alert("Reserva cancelada exitosamente");
      refreshLots(); // Trigger data refresh
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  // REJECT endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/reject
  const handleReject = async () => {
    if (!contract_id) {
      alert("No contract_id available to reject this contract.");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}/contracts/${contract_id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error rejecting the contract");
      }
      alert("Contrato rechazado exitosamente");
      refreshLots(); // Trigger data refresh
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <tr className="border-b border-bgray-300 dark:border-darkblack-400">
      {/* Proyecto */}
      <td className="px-6 py-5 xl:px-0">
        <p className="text-base font-semibold text-bgray-900 dark:text-white">
          {project_name}
        </p>
      </td>

      {/* Nombre */}
      <td className="px-6 py-5 xl:px-0">
        <p className="text-base font-medium text-bgray-900 dark:text-white">
          {name}
        </p>
      </td>

      {/* Dimensiones */}
      <td className="px-6 py-5 xl:px-0">
        <p className="text-base font-medium text-bgray-900 dark:text-white">
          {dimensions}{measurement_unit ? ` (${measurement_unit})` : ""}
        </p>
        {area !== undefined && (
          <p className="text-xs text-bgray-600 dark:text-bgray-50">
            Área: {area} {measurement_unit || 'm2'}
          </p>
        )}
      </td>

      {/* Balance */}
      <td className="px-6 py-5 xl:px-0">
        <p className="text-base font-medium text-bgray-900 dark:text-white">
          {balance} HNL
        </p>
      </td>

      {/* Reservado Por */}
      <td className="px-6 py-5 xl:px-0">
        <p className="text-base font-medium text-bgray-900 dark:text-white">
          {reserved_by}
        </p>
      </td>

      {/* Estado */}
      <td className="px-6 py-5 xl:w-[165px] xl:px-0">
        <div className="flex w-full items-center">
          <span
            className={`block rounded-md bg-success-50 px-4 py-1.5 text-sm font-semibold leading-[22px] ${status?.toLowerCase() === "available" ? "bg-success-100" : "bg-yellow-100"
              }  dark:bg-darkblack-500`}
          >
            {formatStatus(status)}
          </span>
        </div>
      </td>

      {/* Action Buttons */}
      <td className="px-6 py-5 xl:px-0">
        <div className="flex items-center gap-4">
          {/* RESERVAR link */}
          {status?.toLowerCase() === "available" && (
            <Link
              to={`/projects/${project_id}/lots/${lot_id}/contracts/create`}
              className="bg-success-300 hover:bg-success-400 text-white font-bold py-1 px-3 rounded"
            >
              Reservar
            </Link>
          )}

          {/* CANCEL button */}
          {contract_id && (
            <button
              onClick={handleCancel}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
            >
              Cancelar
            </button>
          )}

          {/* REJECT button for admin */}
          {userRole === "admin" && contract_id && (
            <button
              onClick={handleReject}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
            >
              Rechazar
            </button>
          )}
          {/* UPDATE button for admin - navigates to lot edit page */}
          {userRole === "admin" && (
            <Link
              to={`/projects/${project_id}/lots/${lot_id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
            >
              Editar
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}

LotInfo.propTypes = {
  project_name: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dimensions: PropTypes.string.isRequired,
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  reserved_by: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,

  // Additional fields needed for the new buttons
  project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  lot_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  contract_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  // Role check if only admins can reject
  userRole: PropTypes.string.isRequired,

  // Function to refresh lots in parent component
  refreshLots: PropTypes.func.isRequired,

  // New optional fields for measurement unit and area
  measurement_unit: PropTypes.string,
  area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default LotInfo;