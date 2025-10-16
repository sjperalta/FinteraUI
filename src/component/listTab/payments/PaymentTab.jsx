// src/component/listTab/payments/PaymentTab.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import PaymentInfo from "./PaymentInfo"; // Component to render individual payment rows
import { useLocale } from "../../../contexts/LocaleContext";

function PaymentTab({ payments, userRole, pageSize, refreshPayments }) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const { t } = useLocale();

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
    <div className="w-full">
      {/* Desktop Table View */}
      <div className=" rounded-xl border-2 border-gray-200 dark:border-darkblack-400 shadow-lg">
        <table className="w-full bg-white dark:bg-darkblack-600">
          <thead>
            <tr className="border-b-2 border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-darkblack-500 dark:to-darkblack-400">
              {/* Descripción */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {t('payments.description')}
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('description')}</div>
                </div>
              </th>

              {/* Solicitante */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {t('payments.applicant')}
                  </span>
                </div>
              </th>

              {/* Monto Total */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {t('payments.totalAmount')}
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('amount')}</div>
                </div>
              </th>

              {/* Vencimiento */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {t('payments.dueDate')}
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('due_date')}</div>
                </div>
              </th>

              {/* Estado */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {t('payments.status')}
                  </span>
                  {/* Sorting Icon */}
                  <div className="flex-shrink-0">{renderSortIcon('status')}</div>
                </div>
              </th>

              {/* Acciones */}
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {t('payments.actions')}
                </span>
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

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3 sm:space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 p-4 shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
          >
            <PaymentInfo
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
              isMobileCard={true}
            />
          </div>
        ))}
      </div>
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