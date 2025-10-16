// src/component/listTab/contracts/ContractTab.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import ContractInfo from "./ContractInfo";

function ContractTab({ contracts, userRole, pageSize, refreshContracts, sortField, sortDirection }) {

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

    // Call the refreshContracts function with the new sort parameters
    refreshContracts({ sortField: field, sortDirection: direction });
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
              {/* Cliente */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Cliente
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('applicant_user_id')}</div>
                </div>
              </th>

              {/* Lote */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Lote
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('lot_id')}</div>
                </div>
              </th>

              {/* Financiamiento */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Financiamiento
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('financing_type')}</div>
                </div>
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

              {/* Creado */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Creado
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('contracts.created_at')}</div>
                </div>
              </th>

              {/* Creado Por */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Creado Por
                </span>
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
            {contracts?.map((contract) => (
              <ContractInfo
                key={contract.id}
                applicant_name={contract.applicant_name}
                applicant_phone={contract.applicant_phone}
                applicant_identity={contract.applicant_identity}
                applicant_credit_score={contract.applicant_credit_score}
                created_by={contract.created_by}
                approved_at={contract.approved_at}
                lot_name={contract.lot_name}
                lot_address={contract.lot_address}
                balance={contract.balance}
                financing_type={contract.financing_type}
                down_payment={contract.down_payment}
                amount={contract.amount}
                payment_term={contract.payment_term}
                reserve_amount={contract.reserve_amount}
                status={contract.status}
                project_name={contract.project_name}
                project_address={contract.project_address}
                rejection_reason={contract.rejection_reason}
                note={contract.note}
                created_at={contract.created_at}
                project_id={contract.project_id}
                lot_id={contract.lot_id}
                payment_schedule={contract.payment_schedule}
                contract_id={contract.id}
                userRole={userRole}
                refreshContracts={refreshContracts}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block xl:hidden space-y-3 sm:space-y-4">
        {contracts?.map((contract) => (
          <div
            key={contract.id}
            className="bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 p-4 shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
          >
            <ContractInfo
              applicant_name={contract.applicant_name}
              applicant_phone={contract.applicant_phone}
              applicant_identity={contract.applicant_identity}
              applicant_credit_score={contract.applicant_credit_score}
              created_by={contract.created_by}
              approved_at={contract.approved_at}
              lot_name={contract.lot_name}
              lot_address={contract.lot_address}
              balance={contract.balance}
              financing_type={contract.financing_type}
              down_payment={contract.down_payment}
              amount={contract.amount}
              payment_term={contract.payment_term}
              reserve_amount={contract.reserve_amount}
              status={contract.status}
              project_name={contract.project_name}
              project_address={contract.project_address}
              rejection_reason={contract.rejection_reason}
              note={contract.note}
              created_at={contract.created_at}
              project_id={contract.project_id}
              lot_id={contract.lot_id}
              payment_schedule={contract.payment_schedule}
              contract_id={contract.id}
              userRole={userRole}
              refreshContracts={refreshContracts}
              isMobileCard={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

ContractTab.propTypes = {
  contracts: PropTypes.array.isRequired,
  userRole: PropTypes.string.isRequired,
  pageSize: PropTypes.number,
  refreshContracts: PropTypes.func.isRequired,
  sortField: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
};

export default ContractTab;