// src/component/listTab/payments/PaymentTab.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import PaymentInfo from "./PaymentInfo"; // Component to render individual payment rows

function PaymentTab({ payments, userRole, pageSize, refreshPayments }) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

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

    // Call the refreshPayments function with the new sort parameter
    refreshPayments({ sort: sortParam });
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
            {/* Descripción */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Descripción
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('description')}
              </div>
            </th>

            {/* Solicitante */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Solicitante
                </span>
              </div>
            </th>

            {/* Monto Total */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Monto Total
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('amount')}
              </div>
            </th>

            {/* Vencimiento */}
            <th className="px-6 py-5 xl:px-0 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="text-base font-medium text-bgray-600 dark:text-bgray-50">
                  Vencimiento
                </span>
                {/* Sorting Icon */}
                {renderSortIcon('due_date')}
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
          {payments.map((payment) => (
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
              currency={payment.contract?.currency || "HNL"}
              applicant_name={payment.contract?.applicant_user?.full_name}
              applicant_phone={payment.contract?.applicant_user?.phone}
              applicant_identity={payment.contract?.applicant_user?.identity}
              lot_name={payment.contract?.lot?.name}
              lot_address={payment.contract?.lot?.address}
              pageSize={pageSize}
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