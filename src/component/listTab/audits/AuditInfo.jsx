// src/components/listTab/audits/AuditInfo.jsx

import React from "react";
import PropTypes from "prop-types";

/**
 * Utility function to format event names
 * @param {string} event - The event type
 * @returns {string} - Formatted event name
 */
const formatEvent = (event) => {
  switch (event.toLowerCase()) {
    case "create":
      return "Crear";
    case "update":
      return "Actualizar";
    case "destroy":
      return "Eliminar";
    default:
      return event.charAt(0).toUpperCase() + event.slice(1);
  }
};

/**
 * Utility function to format date strings
 * @param {string} dateStr - The date string
 * @returns {string} - Formatted date
 */
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

/**
 * Component to display individual audit log details
 * @param {object} props - Component props
 */
function AuditInfo({
  event,
  model,
  itemId,
  user,
  changes,
  date,
  ipAddress,
  userAgent,
  userRole,
  refreshAudits,
}) {
  return (
    <tr className="border-b border-bgray-300 dark:border-darkblack-400 hover:bg-gray-100 dark:hover:bg-gray-700">
      {/* Event */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {formatEvent(event)}
        </span>
      </td>

      {/* Model */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {model}
        </span>
      </td>

      {/* Item ID */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {itemId}
        </span>
      </td>

      {/* User */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {user}
        </span>
      </td>

      {/* Changes */}
      <td className="px-6 py-4">
        {changes ? (
          Object.entries(changes).map(([field, change]) => (
            <div key={field} className="mb-1">
              <strong>{field}:</strong> {change[0] !== undefined ? change[0] : "N/A"} &rarr;{" "}
              {change[1] !== undefined ? change[1] : "N/A"}
            </div>
          ))
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-300">N/A</span>
        )}
      </td>

      {/* Date */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {formatDate(date)}
        </span>
      </td>

      {/* IP Address */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {ipAddress || "N/A"}
        </span>
      </td>

      {/* User Agent */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {userAgent || "N/A"}
        </span>
      </td>
    </tr>
  );
}

AuditInfo.propTypes = {
  event: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  user: PropTypes.string.isRequired,
  changes: PropTypes.object,
  date: PropTypes.string.isRequired,
  ipAddress: PropTypes.string,
  userAgent: PropTypes.string,
  userRole: PropTypes.string.isRequired,
  refreshAudits: PropTypes.func.isRequired,
};

export default AuditInfo;