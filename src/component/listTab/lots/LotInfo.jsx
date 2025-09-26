// src/component/listTab/lots/LotInfo.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../../context/AuthContext";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";
import { formatStatus } from "../../../utils/formatStatus"; // Ensure this path is correct

/**
 * This component displays a single lot row.
 * It includes:
 * - "Reservar" link, which redirects to create a contract
 * - "Editar" button for admins, which navigates to lot edit page
 */
function LotInfo({
  project_name,
  name,
  address,              // new field
  registration_number,  // new field
  dimensions,
  balance,              // keeping for backward compatibility
  price,                // new field
  override_price,       // new field
  reserved_by,
  reserved_by_user_id,
  contract_created_by,
  contract_created_user_id,
  status,
  project_id,
  lot_id,
  contract_id,
  userRole,
  refreshLots,
  measurement_unit,     // new optional
  area,                 // new optional
  isHighlighted,        // new prop for highlighting from contract navigation
}) {
  const token = getToken();
  const { user } = useContext(AuthContext) || {};
  const currentUserId = user?.id ?? null;
  // Normalize status and provide Spanish labels
  const statusLower = status?.toLowerCase() || '';
  const statusLabel =
    statusLower === 'available' ? 'Disponible' :
    statusLower === 'reserved' ? 'Reservado' :
    statusLower === 'sold' ? 'Vendido' :
    formatStatus(status);

  // Badge classes with proper dark mode variants
  let badgeClass = 'block rounded-md px-4 py-1.5 text-sm font-semibold leading-[22px] ';
  if (statusLower === 'available') {
    badgeClass += 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  } else if (statusLower === 'reserved') {
    badgeClass += 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  } else if (statusLower === 'sold') {
    badgeClass += 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
  } else {
    badgeClass += 'bg-gray-100 dark:bg-darkblack-500';
  }

  return (
    <tr className={`border-b border-bgray-300 dark:border-darkblack-400 ${
      isHighlighted 
        ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-700' 
        : ''
    }`}>
      {/* Proyecto */}
      <td className="px-6 py-5 xl:px-0">
        <p className="text-base font-semibold text-bgray-900 dark:text-white">
          {project_name}
        </p>
      </td>

      {/* Información consolidada del lote con proyecto */}
      <td className="px-6 py-5 xl:px-0">
        <div className="space-y-1">
          <p className="text-base font-semibold text-bgray-900 dark:text-white">
            {name}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            🏢 {project_name}
          </p>
          {address && (
            <p className="text-sm text-bgray-600 dark:text-bgray-300">
              📍 {address}
            </p>
          )}
          {registration_number && (
            <p className="text-xs text-bgray-500 dark:text-bgray-400 font-mono">
              REG: {registration_number}
            </p>
          )}
        </div>
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

      {/* Precio y Precio Especial */}
      <td className="px-6 py-5 xl:px-0">
        <div className="space-y-1">
          {override_price && override_price > 0 ? (
            // Show override price as main price with original crossed out
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <p className="text-base font-semibold text-green-600 dark:text-green-400">
                  {Number(override_price).toLocaleString()} HNL
                </p>
                <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  Precio Especial
                </span>
              </div>
              <p className="text-sm text-bgray-500 dark:text-bgray-400 line-through">
                Precio original: {Number(price).toLocaleString()} HNL
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Ahorro: {Number(price - override_price).toLocaleString()} HNL
              </p>
            </div>
          ) : (
            // Show regular price
            <p className="text-base font-semibold text-bgray-900 dark:text-white">
              {price ? `${Number(price).toLocaleString()} HNL` : (balance ? `${balance} HNL` : "N/A")}
            </p>
          )}
        </div>
      </td>

      {/* Reservado Por */}
      <td className="px-6 py-5 xl:px-0">
        {/**
         * Show link to user balance only when:
         * - reserved_by_id exists AND
         * - current user is admin OR current user created the reservation
         */}
        {reserved_by_user_id && (userRole === 'admin' || String(contract_created_user_id) === String(currentUserId)) ? (
          <Link to={`/balance/user/${reserved_by_user_id}`} className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline">
            {reserved_by}
          </Link>
        ) : (
          <p className="text-base font-medium text-bgray-900 dark:text-white">{reserved_by}</p>
        )}

        {/* If the logged user is the creator of the reservation, show who created it (useful context) */}
        {contract_created_by && (userRole === 'admin' || String(contract_created_user_id) === String(currentUserId)) && (
          <p className="text-xs text-bgray-500 dark:text-bgray-400 mt-1">Reserva creada por: {contract_created_by}</p>
        )}
      </td>

      {/* Estado */}
      <td className="px-6 py-5 xl:w-[165px] xl:px-0">
        <div className="flex w-full items-center">
          <span className={badgeClass}>
            {statusLabel}
          </span>
        </div>
      </td>

      {/* Action Buttons */}
      <td className="px-6 py-5 xl:px-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* RESERVAR link */}
          {status?.toLowerCase() === "available" && (
            <Link
              to={`/projects/${project_id}/lots/${lot_id}/contracts/create`}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Reservar
            </Link>
          )}

          {/* UPDATE button for admin */}
          {userRole === "admin" && status?.toLowerCase() !== 'sold' && (
            <Link
              to={`/projects/${project_id}/lots/${lot_id}/edit`}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
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
  name: PropTypes.string.isRequired, // lot_name from backend
  address: PropTypes.string, // lot_address from backend
  registration_number: PropTypes.string,
  dimensions: PropTypes.string.isRequired,
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // keeping for backward compatibility
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // lot_price from backend
  override_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // lot_override_price from backend
  reserved_by: PropTypes.string.isRequired,
  reserved_by_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reserved_by_user: PropTypes.string,
  contract_created_by: PropTypes.string,
  contract_created_user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.string.isRequired,

  // Additional fields
  project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  lot_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  contract_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  // Role check for admin actions
  userRole: PropTypes.string.isRequired,

  // Function to refresh lots in parent component
  refreshLots: PropTypes.func.isRequired,

  // New optional fields for measurement unit and area
  measurement_unit: PropTypes.string,
  area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  
  // Highlighting prop for navigation from contracts
  isHighlighted: PropTypes.bool,
};

export default LotInfo;