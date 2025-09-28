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
    <div className="table-content w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-bgray-300 dark:border-darkblack-400">
            {/* Cliente */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Cliente
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('applicant_user_id')}
              </div>
            </th>

            {/* Lote */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Lote
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('lot_id')}
              </div>
            </th>

            {/* Financiamiento */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Financiamiento
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('financing_type')}
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

            {/* Creado */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Creado
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('contracts.created_at')}
              </div>
            </th>

            {/* Creado Por */}
            <th className="w-[165px] px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Creado Por
                </span>
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
              cancellation_notes={contract.cancellation_notes}
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