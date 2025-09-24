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

  const getStatusIcon = () => {
    switch (initialStatus) {
      case "paid":
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "submitted":
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "pending":
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (initialStatus) {
      case "paid":
        return "Pagado";
      case "submitted":
        return "En Revisión";
      case "pending":
        return "Pendiente";
      default:
        return initialStatus.charAt(0).toUpperCase() + initialStatus.slice(1);
    }
  };

  return (
    <div className="payment-card bg-white dark:bg-darkblack-700 rounded-lg border border-gray-200 dark:border-darkblack-500 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header with title and status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-lg text-bgray-900 dark:text-white">
              {description}
            </h4>
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vencido
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </span>
        </div>
      </div>

      {/* Payment details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-darkblack-600 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-sm font-medium text-bgray-700 dark:text-bgray-200">Monto</span>
          </div>
          <p className="text-xl font-bold text-bgray-900 dark:text-white">
            {contract.currency} {Number(amount).toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-darkblack-600 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7h8M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
            </svg>
            <span className="text-sm font-medium text-bgray-700 dark:text-bgray-200">Fecha Vencimiento</span>
          </div>
          <p className={`text-lg font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-bgray-900 dark:text-white"}`}>
            {formattedDueDate}
          </p>
        </div>

        {interest_amount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 mb-1">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">Interés Moratorio</span>
            </div>
            <p className="text-lg font-bold text-red-800 dark:text-red-200">
              {contract.currency} {Number(interest_amount).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Action button */}
      {initialStatus !== "paid" && initialStatus !== "submitted" && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-darkblack-500">
          <button
            onClick={goToUploadPage}
            className="inline-flex items-center px-6 py-3 bg-success-300 hover:bg-success-400 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Realizar Pago
          </button>
        </div>
      )}
    </div>
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