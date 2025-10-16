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
    <div className="table-content w-full">
      {/* Desktop Table View */}
      <div className="hidden xl:block w-full overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-darkblack-400 shadow-lg">
        <table className="w-full bg-white dark:bg-darkblack-600">
          <thead>
            <tr className="border-b-2 border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-darkblack-500 dark:to-darkblack-400">
              {/* Proyecto */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Proyecto
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('project_id')}</div>
                </div>
              </th>

              {/* Nombre (ahora incluye dirección y registro) */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Lote
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('name')}</div>
                </div>
              </th>

              {/* Dimensiones */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Dimensiones
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('width')}</div>
                </div>
              </th>

              {/* Precio (actualizado desde Balance) */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Precio
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('price')}</div>
                </div>
              </th>

              {/* Reservado Por */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Reservado Por
                </span>
              </th>

              {/* Estado */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Estado
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('status')}</div>
                </div>
              </th>

              {/* Acciones */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Acciones
                </span>
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

      {/* Mobile Card View */}
      <div className="block xl:hidden space-y-3 sm:space-y-4">
        {lots?.map((lot) => (
          <div
            key={lot.id}
            className={`bg-white dark:bg-darkblack-600 rounded-xl border-2 ${
              highlightedLotId && lot.id === highlightedLotId
                ? 'border-blue-500 dark:border-blue-600 shadow-xl'
                : 'border-gray-200 dark:border-darkblack-400 shadow-md'
            } p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200`}
          >
            <LotInfo
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
              isMobileCard={true}
            />
          </div>
        ))}
      </div>
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
      balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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