// src/component/listTab/payments/PaymentTab.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import PaymentInfo from "./PaymentInfo"; // Component to render individual payment rows

function PaymentTab({ payments, userRole, pageSize, refreshPayments }) {
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
    refreshPayments({ sort: sortParam, page: 1, per_page: pageSize });
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
            {/* Description */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">Descripción</span>
                {renderSortIcon("description")}
              </div>
            </th>
            {/* Amount */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">Monto</span>
                {renderSortIcon("amount")}
              </div>
            </th>
            {/* Due Date */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">Fecha de Vencimiento</span>
                {renderSortIcon("due_date")}
              </div>
            </th>
            {/* Interest */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">Interés</span>
                {renderSortIcon("interest_amount")}
              </div>
            </th>
            {/* Status */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">Estado</span>
                {renderSortIcon("status")}
              </div>
            </th>
            {/* Actions */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">Acciones</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {payments?.map((payment) => (
            <PaymentInfo
              key={payment.id}
              description={payment.description}
              amount={payment.amount}
              due_date={payment.due_date}
              interest_amount={payment.interest_amount}
              status={payment.status}
              payment_id={payment.id}
              userRole={userRole}
              refreshPayments={refreshPayments}
              currency={payment.contract.currency}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

PaymentTab.propTypes = {
  payments: PropTypes.array.isRequired,
  userRole: PropTypes.string.isRequired,
  pageSize: PropTypes.number,
  refreshPayments: PropTypes.func.isRequired,
};

export default PaymentTab;