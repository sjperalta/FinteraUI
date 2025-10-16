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
    <div className="table-content w-full">
      {/* Desktop Table View */}
      <div className="hidden xl:block w-full overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-darkblack-400 shadow-lg">
        <table className="w-full bg-white dark:bg-darkblack-600">
          <thead>
            <tr className="border-b-2 border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-darkblack-500 dark:to-darkblack-400">
              {/* Event */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex space-x-2 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Evento
                  </span>
                  {/* Sorting Icon */}
                  <button onClick={() => handleSort("event")} className="focus:outline-none flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {getSortIcon("event")}
                  </button>
                </div>
              </th>
              {/* Model */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex space-x-2 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Modelo
                  </span>
                  {/* Sorting Icon */}
                  <button onClick={() => handleSort("item_type")} className="focus:outline-none flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {getSortIcon("item_type")}
                  </button>
                </div>
              </th>
              {/* Item ID */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  ID del Ítem
                </span>
              </th>
              {/* User */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex space-x-2 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Usuario
                  </span>
                  {/* Sorting Icon */}
                  <button onClick={() => handleSort("whodunnit")} className="focus:outline-none flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {getSortIcon("whodunnit")}
                  </button>
                </div>
              </th>
              {/* Changes */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Cambios
                </span>
              </th>
              {/* Date */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex space-x-2 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Fecha
                  </span>
                  {/* Sorting Icon */}
                  <button onClick={() => handleSort("created_at")} className="focus:outline-none flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {getSortIcon("created_at")}
                  </button>
                </div>
              </th>
              {/* IP Address */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex space-x-2 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Dirección IP
                  </span>
                  <button onClick={() => handleSort("ip")} className="focus:outline-none flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {getSortIcon("ip")}
                  </button>
                </div>
              </th>
              {/* User Agent */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
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

      {/* Mobile Card View */}
      <div className="block xl:hidden space-y-3 sm:space-y-4">
        {audits?.map((audit) => (
          <div
            key={audit.id}
            className="bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 p-4 shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
          >
            <AuditInfo
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
              isMobileCard={true}
            />
          </div>
        ))}
      </div>
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