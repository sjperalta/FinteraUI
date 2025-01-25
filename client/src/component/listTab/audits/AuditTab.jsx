// src/components/listTab/audits/AuditTab.jsx

import React from "react";
import PropTypes from "prop-types";
import AuditInfo from "./AuditInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";

/**
 * Component to display audit logs in a table format
 * @param {Array} audits - Array of audit log objects
 * @param {string} userRole - Role of the current user
 * @param {Function} refreshAudits - Function to refresh audit logs
 * @param {Function} handleSort - Function to handle sorting
 * @param {string} currentSort - Current sort parameter
 */
function AuditTab({ audits, userRole, pageSize, refreshAudits, handleSort, currentSort }) {
  /**
   * Determine sort icon for a given field
   * @param {string} field - The field to sort by
   * @returns {JSX.Element} - Sort icon
   */
  const getSortIcon = (field) => {
    if (!currentSort) {
      return <FontAwesomeIcon icon={faSort} />;
    }
    const [currentField, direction] = currentSort.split("-");
    if (currentField !== field) {
      return <FontAwesomeIcon icon={faSort} />;
    }
    return direction === "asc" ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />;
  };

  return (
    <div className="table-content w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-bgray-300 dark:border-darkblack-400">
            {/* Event */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5 items-center">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Evento
                </span>
                {/* Sorting Icon */}
                <button onClick={() => handleSort("event")} className="focus:outline-none">
                  {getSortIcon("event")}
                </button>
              </div>
            </th>
            {/* Model */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5 items-center">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Modelo
                </span>
                {/* Sorting Icon */}
                <button onClick={() => handleSort("item_type")} className="focus:outline-none">
                  {getSortIcon("item_type")}
                </button>
              </div>
            </th>
            {/* Item ID */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                ID del Ítem
              </span>
            </th>
            {/* User */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5 items-center">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Usuario
                </span>
                {/* Sorting Icon */}
                <button onClick={() => handleSort("whodunnit")} className="focus:outline-none">
                  {getSortIcon("whodunnit")}
                </button>
              </div>
            </th>
            {/* Changes */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Cambios
              </span>
            </th>
            {/* Date */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5 items-center">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Fecha
                </span>
                {/* Sorting Icon */}
                <button onClick={() => handleSort("created_at")} className="focus:outline-none">
                  {getSortIcon("created_at")}
                </button>
              </div>
            </th>
            {/* IP Address */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Dirección IP
              </span>
              <button onClick={() => handleSort("ip")} className="focus:outline-none">
                {getSortIcon("ip")}
              </button>
            </th>
            {/* User Agent */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Agente de Usuario
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {audits?.map((audit) => (
            <AuditInfo
              key={audit.id}
              event={audit.event}
              model={audit.item_type}
              itemId={audit.item_id}
              user={audit.user}
              changes={audit.changes}
              date={audit.created_at}
              ipAddress={audit.ip}
              userAgent={audit.user_agent}
              userRole={userRole}
              refreshAudits={refreshAudits}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

AuditTab.propTypes = {
  audits: PropTypes.array.isRequired,
  userRole: PropTypes.string.isRequired,
  pageSize: PropTypes.number,
  refreshAudits: PropTypes.func.isRequired,
  handleSort: PropTypes.func.isRequired,
  currentSort: PropTypes.string,
};

export default AuditTab;