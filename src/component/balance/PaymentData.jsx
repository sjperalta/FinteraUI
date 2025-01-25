// src/components/payments/PaymentData.jsx

import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { format, isBefore, parseISO, startOfDay } from "date-fns";

function PaymentData({ paymentData, user, index }) {
  const { id, contract, description, amount, due_date, status: initialStatus, interest_amount } = paymentData;
  const navigate = useNavigate();

  // Function to navigate to the Upload page
  const goToUploadPage = () => {
    navigate(`/balance/user/${user.id}/payment/${id}/upload`);
  };

  // Parse the due_date string into a Date object
  const dueDate = parseISO(due_date);
  
  // Get the start of today to ignore time components
  const todayStart = startOfDay(new Date());

  // Determine if the payment is overdue (due_date < todayStart)
  const isOverdue = isBefore(dueDate, todayStart);

  // Format the due date for display
  const formattedDueDate = format(dueDate, "dd MMM yyyy"); // e.g., "24 Oct 2023"

    // Determine the color for the status
  const statusColor =
    initialStatus === "paid" || initialStatus === "submitted"
      ? "bg-green-100 text-green-800"
      : initialStatus === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : isOverdue
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";

  return (
    <tr className={index % 2 === 0 ? "bg-white dark:bg-darkblack-600" : "bg-gray-50 dark:bg-darkblack-700"}>
      <td className="whitespace-nowrap py-4 text-sm text-gray-500 w-[400px] lg:w-auto">
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <h4 className="font-bold text-lg text-bgray-900 dark:text-white">
              {description} {isOverdue && (
                  <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    Vencido
                  </span>
                )}
            </h4>
            <div className="mt-1">
              <span className="font-medium text-base text-bgray-700 dark:text-bgray-50">
                Monto: {contract.currency} {Number(amount).toLocaleString()} 
                {interest_amount > 0 ? ` | Mora: ${interest_amount}`: '' }
              </span>
              <br />
              <span className={`text-sm ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
                Vence: {formattedDueDate}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
        >
          {initialStatus.charAt(0).toUpperCase() + initialStatus.slice(1)}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        {initialStatus !== "paid" && initialStatus !== "submitted" && (
        <button
          onClick={goToUploadPage}
          className="bg-success-300 hover:bg-success-400 text-white font-bold py-2 px-4 rounded"
        >
          Pagar
        </button>
        )}
      </td>
      <td className="whitespace-nowrap pr-3 py-4 text-sm text-gray-500 rounded-r-lg">
        {/* Additional actions if needed */}
      </td>
    </tr>
  );
}

PaymentData.propTypes = {
  paymentData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    contract: PropTypes.shape({
      currency: PropTypes.string.isRequired,
    }).isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    due_date: PropTypes.string.isRequired, // ISO date string
    status: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default PaymentData;