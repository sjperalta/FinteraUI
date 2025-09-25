import { useState } from "react";
import PropTypes from "prop-types";
import LotInfo from "./LotInfo";

/**
 * This component renders the table headers and maps over the lots to render each LotInfo row.
 * It accepts lots data, user role, page size, and a refresh function to update data after actions.
 */
function LotTab({ lots, userRole, pageSize, refreshLots, highlightedLotId }) {
  // State for sorting
  const [sortField, setSortField] = useState(null); // e.g., 'name', 'project_name'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  /**
   * Handles sorting when a table header is clicked.
   * @param {string} field - The field to sort by.
   */
  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field) {
      // Toggle sort direction if the same field is clicked
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortDirection(direction);

    // Prepare the sort parameter for the API
    const sortParam = `${field}-${direction}`;

    // Call the refreshLots function with the new sort parameter
    refreshLots({ sort: sortParam, page: 1, per_page: pageSize });
  };

  /**
   * Determines the sort icon based on the current sort state.
   * @param {string} field - The field associated with the sort icon.
   * @returns {JSX.Element} - The SVG icon with appropriate rotation.
   */
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      // Default sort icon (neutral)
      return (
        <svg
          width="14"
          height="15"
          viewBox="0 0 14 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer"
          onClick={() => handleSort(field)}
        >
          <path
            d="M10.332 1.31567V13.3157"
            stroke="#718096"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.66602 11.3157L3.66602 13.3157L1.66602 11.3157"
            stroke="#718096"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.66602 13.3157V1.31567"
            stroke="#718096"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.332 3.31567L10.332 1.31567L8.33203 3.31567"
            stroke="#718096"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    // Determine the rotation based on sort direction
    const rotation = sortDirection === 'asc' ? 'rotate-180' : 'rotate-0';

    return (
      <svg
        width="14"
        height="15"
        viewBox="0 0 14 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`cursor-pointer transform ${rotation} transition-transform duration-200`}
        onClick={() => handleSort(field)}
      >
        <path
          d="M10.332 1.31567V13.3157"
          stroke="#718096"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.66602 11.3157L3.66602 13.3157L1.66602 11.3157"
          stroke="#718096"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.66602 13.3157V1.31567"
          stroke="#718096"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.332 3.31567L10.332 1.31567L8.33203 3.31567"
          stroke="#718096"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="table-content w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-bgray-300 dark:border-darkblack-400">
            {/* Proyecto */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Proyecto
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('project_id')}
              </div>
            </th>

            {/* Nombre (ahora incluye dirección y registro) */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Lote
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('name')}
              </div>
            </th>

            {/* Dimensiones */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Dimensiones
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('width')}
              </div>
            </th>

            {/* Precio (actualizado desde Balance) */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Precio
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('price')}
              </div>
            </th>

            {/* Reservado Por */}
            <th className="w-[165px] px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Reservado Por
                </span>
              </div>
            </th>

            {/* Estado */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Estado
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('status')}
              </div>
            </th>

            {/* Acciones */}
            <th className="px-6 py-5 xl:px-0 text-center">
              <div className="flex justify-center">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Acciones
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {/* We'll pass userRole and refreshLots as props to each <LotInfo /> */}
          {lots?.map((lot) => (
            <LotInfo
              key={lot.id}
              project_name={lot.project_name}
              name={lot.name}
              address={lot.address}
              registration_number={lot.registration_number}
              dimensions={lot.dimensions}
              balance={lot.balance}
              price={lot.price}
              override_price={lot.override_price}
              contract_created_user_id={lot.contract_created_user_id}
              contract_created_by={lot.contract_created_by}
              reserved_by={lot.reserved_by}
              reserved_by_user_id={lot.reserved_by_user_id}
              status={lot.status}
              project_id={lot.project_id}
              lot_id={lot.id}
              contract_id={lot.contract_id}
              userRole={userRole}
              refreshLots={refreshLots}
              measurement_unit={lot.measurement_unit}
              area={lot.area}
              isHighlighted={highlightedLotId && lot.id === highlightedLotId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

LotTab.propTypes = {
  lots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      project_name: PropTypes.string,
      name: PropTypes.string,
      dimensions: PropTypes.string,
      balance: PropTypes.string,
      reserved_by: PropTypes.string,
      status: PropTypes.string,
      project_id: PropTypes.number,
      contract_id: PropTypes.number,
    })
  ).isRequired,
  userRole: PropTypes.string.isRequired, // new prop
  pageSize: PropTypes.number,            // existing prop
  refreshLots: PropTypes.func.isRequired, // new prop
  highlightedLotId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // new prop for highlighting
};

export default LotTab;