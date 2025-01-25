// src/component/listTab/contracts/ContractTab.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import ContractInfo from "./ContractInfo";

function ContractTab({ contracts, userRole, pageSize, refreshContracts }) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    let direction = "asc";

    if (sortField === field) {
      direction = sortDirection === "asc" ? "desc" : "asc";
    }
    setSortField(field);
    setSortDirection(direction);

    const sortParam = `${field}-${direction}`;
    refreshContracts({ sort: sortParam, page: 1, per_page: pageSize });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg width="14" height="15" fill="none" onClick={() => handleSort(field)}>
          <path d="M10.332 1.31567V13.3157" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5.66602 11.3157L3.66602 13.3157L1.66602 11.3157" stroke="#718096" strokeWidth="1.5" />
          <path d="M3.66602 13.3157V1.31567" stroke="#718096" strokeWidth="1.5" />
          <path d="M12.332 3.31567L10.332 1.31567L8.33203 3.31567" stroke="#718096" strokeWidth="1.5" />
        </svg>
      );
    }

    const rotation = sortDirection === "asc" ? "rotate-180" : "rotate-0";
    return (
      <svg width="14" height="15" fill="none" className={`transform ${rotation}`} onClick={() => handleSort(field)}>
        <path d="M10.332 1.31567V13.3157" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5.66602 11.3157L3.66602 13.3157L1.66602 11.3157" stroke="#718096" strokeWidth="1.5" />
        <path d="M3.66602 13.3157V1.31567" stroke="#718096" strokeWidth="1.5" />
        <path d="M12.332 3.31567L10.332 1.31567L8.33203 3.31567" stroke="#718096" strokeWidth="1.5" />
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
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                 Nombre Cliente
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('applicant_user_id')}
              </div>
            </th>
            {/* Proyecto */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                 Lote
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('lot_id')}
              </div>
            </th>
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Balance
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('balance')}
              </div>
            </th>
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Financiamiento
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('financing_type')}
              </div>
            </th>
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Reserva
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('reserve_amount')}
              </div>
            </th>
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Estado
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('status')}
              </div>
            </th>
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Creado
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('created_at')}
              </div>
            </th>
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                Creado Por
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {contracts?.map((contract) => (
            <ContractInfo
              key={contract.id}
              customer_name={contract.customer_name}
              created_by={contract.created_by}
              lot_name={contract.lot_name}
              balance={contract.balance}
              financing_type={contract.financing_type}
              reserve_amount={contract.reserve_amount}
              status={contract.status}
              created_at={contract.created_at}
              project_id={contract.project_id}
              lot_id={contract.lot_id}
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
};

export default ContractTab;