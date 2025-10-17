import { useState } from "react";
import PropTypes from "prop-types";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { formatStatus } from "../../utils/formatStatus";
import { useLocale } from "../../contexts/LocaleContext";
import Toast from "../ui/Toast";

/**
 * PaymentItem Component - Dual rendering for GenericList
 * Supports both mobile card view and desktop table row view
 */
function PaymentItem({ paymentInfo, index, userRole, refreshPayments, onClick, isMobileCard = false }) {
  const { t } = useLocale();
  const token = getToken();

  // State for approve modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [editAmount, setEditAmount] = useState(paymentInfo.amount);
  const [editInterest, setEditInterest] = useState(paymentInfo.interest_amount || 0);
  const [approvalResult, setApprovalResult] = useState(null); // { type: 'success'|'error', message: string }
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  // Check if document is available
  const hasReceipt = Boolean(paymentInfo.document_url);

  // Format currency
  const formatCurrency = (value, currency = "HNL") => {
    if (value === null || value === undefined || value === "") return "—";
    return `${currency} ${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable');
    try {
      return format(parseISO(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  // Mask identity - shows first 4 and last 4 digits
  const maskIdentity = (identity) => {
    if (!identity) return "N/A";
    const str = String(identity);
    if (str.length <= 8) return str;
    const first4 = str.slice(0, 4);
    const last4 = str.slice(-4);
    const middleLength = str.length - 8;
    return `${first4}${"*".repeat(middleLength)}${last4}`;
  };

  // Calculate overdue status
  const isOverdue = paymentInfo.due_date && !paymentInfo.payment_date
    ? isBefore(parseISO(paymentInfo.due_date), startOfDay(new Date()))
    : false;

  // Calculate total amount
  const totalAmount = Number(paymentInfo.amount || 0) + Number(paymentInfo.interest_amount || 0);

  // Status styling
  const statusLower = (paymentInfo.status || "").toLowerCase();
  const getStatusBadgeClass = () => {
    if (statusLower === "paid") {
      return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
    } else if (statusLower === "submitted") {
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
    } else if (isOverdue) {
      return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
    }
    return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
  };

  const statusLabel = statusLower === "submitted" 
    ? t('payments.statusOptions.submitted')
    : statusLower === "paid" 
    ? t('payments.statusOptions.paid')
    : formatStatus(paymentInfo.status, t);

  // Handle approve payment
  const handleApprove = async () => {
    setApproveLoading(true);
    setApprovalResult(null); // Clear previous result
    try {
      const res = await fetch(`${API_URL}/api/v1/payments/${paymentInfo.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: editAmount,
          interest_amount: editInterest,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.errors?.join(" ") || t('payments.approveError'));
      }
      // Success - show success message
      setApprovalResult({
        type: 'success',
        message: t('payments.approveSuccess') || 'Payment approved successfully!'
      });
      // Refresh payments after a short delay
      setTimeout(() => {
        if (typeof refreshPayments === "function") {
          refreshPayments();
        }
        setShowApproveModal(false);
        setApprovalResult(null);
      }, 2000);
    } catch (err) {
      // Error - show error message in modal
      setApprovalResult({
        type: 'error',
        message: err.message
      });
    } finally {
      setApproveLoading(false);
    }
  };

  // Handle download receipt
  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/payments/${paymentInfo.id}/download_receipt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t('payments.downloadReceiptError'));
      }

      const blob = await response.blob();
      let extension = "";
      switch (blob.type) {
        case "application/pdf":
          extension = ".pdf";
          break;
        case "image/jpeg":
          extension = ".jpg";
          break;
        case "image/png":
          extension = ".png";
          break;
        default:
          extension = "";
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprobante-pago-${paymentInfo.id}${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setToast({ visible: true, message: `Error: ${error.message}`, type: "error" });
      console.error(error);
    }
  };

  // Mobile Card View
  if (isMobileCard) {
    return (
      <>
        <div className="space-y-3">
        {/* Header with description and status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-base font-semibold text-bgray-900 dark:text-white mb-1">
              {paymentInfo.description || t('common.notAvailable')}
            </p>
            {paymentInfo.contract?.lot?.name && (
              <p className="text-sm text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
                <span className="text-blue-600">🏠</span>
                <span>{paymentInfo.contract.lot.name}</span>
              </p>
            )}
            {paymentInfo.contract?.lot?.address && (
              <p className="text-xs text-bgray-400 dark:text-bgray-500 flex items-center gap-1 mt-0.5">
                <span className="text-gray-500">📍</span>
                <span>{paymentInfo.contract.lot?.address}</span>
              </p>
            )}
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass()}`}>
            {statusLabel}
          </span>
        </div>

        {/* Applicant info */}
        {paymentInfo.contract?.applicant_user && (
          <div className="bg-gray-50 dark:bg-darkblack-500 p-3 rounded-lg space-y-1">
            <p className="text-sm font-semibold text-bgray-900 dark:text-white">
              {paymentInfo.contract.applicant_user.full_name}
            </p>
            {paymentInfo.contract?.applicant_user?.phone && (
              <p className="text-xs text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
                <span>📞</span>
                <span>{paymentInfo.contract.applicant_user.phone}</span>
              </p>
            )}
            {paymentInfo.contract?.applicant_user?.identity && (
              <p className="text-xs text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
                <span>🆔</span>
                <span className="font-mono">{maskIdentity(paymentInfo.contract.applicant_user.identity)}</span>
              </p>
            )}
          </div>
        )}

        {/* Amount and due date */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${isOverdue ? "bg-red-50 dark:bg-red-900/10" : "bg-gray-50 dark:bg-darkblack-500"}`}>
            <p className="text-xs text-bgray-500 dark:text-bgray-400 mb-1">
              {t('payments.totalAmount')}
            </p>
            <p className={`text-base font-bold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-bgray-900 dark:text-white"}`}>
              {formatCurrency(totalAmount, paymentInfo.contract?.currency)}
            </p>
            {paymentInfo.interest_amount > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                +{formatCurrency(paymentInfo.interest_amount, paymentInfo.contract?.currency)} {t('paymentHistory.interest')}
              </p>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-darkblack-500 p-3 rounded-lg">
            <p className="text-xs text-bgray-500 dark:text-bgray-400 mb-1">
              {t('payments.dueDate')}
            </p>
            <p className={`text-sm font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-bgray-900 dark:text-white"}`}>
              {formatDate(paymentInfo.due_date)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {statusLower === "submitted" && userRole === "admin" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowApproveModal(true);
              }}
              className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {t('payments.approve')}
            </button>
          )}
          {statusLower === "paid" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasReceipt) {
                  handleDownloadReceipt();
                }
              }}
              disabled={!hasReceipt}
              className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                hasReceipt
                  ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {t('payments.downloadReceipt')}
            </button>
          )}
        </div>

        {/* Approve Modal */}
        {showApproveModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <div
              className="bg-white dark:bg-darkblack-600 rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 px-6 py-5 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    {t('payments.approvePayment')}
                  </h4>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Payment Info Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    📄 {paymentInfo.description}
                  </p>
                  {paymentInfo.contract?.applicant_user && (
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      👤 {paymentInfo.contract.applicant_user.full_name}
                    </p>
                  )}
                </div>

                {/* Document Preview */}
                {hasReceipt && paymentInfo.document_url && (
                  <div className="bg-gray-50 dark:bg-darkblack-500 border-2 border-gray-200 dark:border-darkblack-400 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        📎 {t('payments.attachedDocument')}
                      </h5>
                      <button
                        onClick={handleDownloadReceipt}
                        className="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t('common.download')}
                      </button>
                    </div>
                    <div className="bg-white dark:bg-darkblack-600 rounded-lg overflow-hidden border border-gray-200 dark:border-darkblack-300">
                      {paymentInfo.document_url.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                          src={paymentInfo.document_url}
                          className="w-full h-64"
                          title="Document Preview"
                        />
                      ) : (
                        <img
                          src={paymentInfo.document_url}
                          alt="Payment Receipt"
                          className="w-full h-auto max-h-64 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      <div className="hidden items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm">{t('payments.previewNotAvailable')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    💰 {t('payments.amount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      {paymentInfo.contract?.currency || "HNL"}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-darkblack-400 rounded-xl bg-white dark:bg-darkblack-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Interest Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📈 {t('payments.lateInterest')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      {paymentInfo.contract?.currency || "HNL"}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={editInterest}
                      onChange={(e) => setEditInterest(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-darkblack-400 rounded-xl bg-white dark:bg-darkblack-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Total Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-darkblack-500 dark:to-darkblack-400 rounded-xl p-4 border-2 border-gray-200 dark:border-darkblack-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      💵 Total a Aprobar:
                    </span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {paymentInfo.contract?.currency || "HNL"} {(Number(editAmount) + Number(editInterest)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Approval Result */}
                {approvalResult && (
                  <div className={`rounded-xl p-4 border-2 ${
                    approvalResult.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        approvalResult.type === 'success'
                          ? 'bg-green-100 dark:bg-green-800/50'
                          : 'bg-red-100 dark:bg-red-800/50'
                      }`}>
                        {approvalResult.type === 'success' ? (
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          approvalResult.type === 'success'
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          {approvalResult.type === 'success' ? '¡Éxito!' : 'Error'}
                        </p>
                        <p className={`text-sm ${
                          approvalResult.type === 'success'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {approvalResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-darkblack-500 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setApprovalResult(null);
                  }}
                  className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-darkblack-600 border-2 border-gray-300 dark:border-darkblack-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkblack-700 transition-all shadow-sm hover:shadow"
                >
                  ✕ {t('common.cancel')}
                </button>
                {!approvalResult?.type && (
                  <button
                    onClick={handleApprove}
                    disabled={approveLoading}
                    className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg flex items-center gap-2"
                  >
                    {approveLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t('common.processing')}</span>
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>{t('payments.approve')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
        <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((s) => ({ ...s, visible: false }))} />
      </>
    );
  }

  // Desktop Table Row View - Return only <td> elements
  return (
    <>
      {/* Description */}
      <td className="px-6 py-5">
        <div className="space-y-1">
          <p className="text-base font-semibold text-bgray-900 dark:text-white">
            {paymentInfo.description || t('common.notAvailable')}
          </p>
          {paymentInfo.contract?.lot?.name && (
            <p className="text-sm text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
              <span className="text-blue-600">🏠</span>
              <span>{paymentInfo.contract.lot.name}</span>
            </p>
          )}
          {paymentInfo.contract?.lot?.address && (
            <p className="text-xs text-bgray-400 dark:text-bgray-500 flex items-center gap-1">
              <span className="text-gray-500">📍</span>
              <span>{paymentInfo.contract.lot.address}</span>
            </p>
          )}
        </div>
      </td>

      {/* Applicant */}
      <td className="px-6 py-5">
        {paymentInfo.contract?.applicant_user ? (
          <div className="space-y-1">
            <p className="text-base font-semibold text-bgray-900 dark:text-white">
              {paymentInfo.contract.applicant_user.full_name}
            </p>
            {paymentInfo.contract.applicant_user.phone && (
              <p className="text-sm text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
                <span className="text-green-600">📞</span>
                <span>{paymentInfo.contract.applicant_user.phone}</span>
              </p>
            )}
            {paymentInfo.contract.applicant_user.identity && (
              <p className="text-sm text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
                <span className="text-blue-600">🆔</span>
                <span className="font-mono">{maskIdentity(paymentInfo.contract.applicant_user.identity)}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-bgray-500 dark:text-bgray-400">{t('common.notAvailable')}</p>
        )}
      </td>

      {/* Amount */}
      <td className="px-6 py-5 text-right">
        <p className={`text-base font-bold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-bgray-900 dark:text-white"}`}>
          {formatCurrency(totalAmount, paymentInfo.contract?.currency)}
        </p>
        {paymentInfo.interest_amount > 0 && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            +{formatCurrency(paymentInfo.interest_amount, paymentInfo.contract?.currency)}
          </p>
        )}
      </td>

      {/* Due Date */}
      <td className="px-6 py-5">
        <p className={`text-sm font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-bgray-900 dark:text-white"}`}>
          {formatDate(paymentInfo.due_date)}
        </p>
      </td>

      {/* Status */}
      <td className="px-6 py-5">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass()}`}>
          {statusLabel}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-5">
        <div className="flex gap-2">
          {statusLower === "submitted" && userRole === "admin" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowApproveModal(true);
              }}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {t('payments.approve')}
            </button>
          )}
          {statusLower === "paid" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasReceipt) {
                  handleDownloadReceipt();
                }
              }}
              disabled={!hasReceipt}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                hasReceipt
                  ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {t('payments.downloadReceipt')}
            </button>
          )}
        </div>

        {/* Approve Modal */}
        {showApproveModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <div
              className="bg-white dark:bg-darkblack-600 rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 px-6 py-5 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    {t('payments.approvePayment')}
                  </h4>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Payment Info Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    📄 {paymentInfo.description}
                  </p>
                  {paymentInfo.contract?.applicant_user && (
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      👤 {paymentInfo.contract.applicant_user.full_name}
                    </p>
                  )}
                </div>

                {/* Document Preview */}
                {hasReceipt && paymentInfo.document_url && (
                  <div className="bg-gray-50 dark:bg-darkblack-500 border-2 border-gray-200 dark:border-darkblack-400 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        📎 {t('payments.attachedDocument')}
                      </h5>
                      <button
                        onClick={handleDownloadReceipt}
                        className="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t('common.download')}
                      </button>
                    </div>
                    <div className="bg-white dark:bg-darkblack-600 rounded-lg overflow-hidden border border-gray-200 dark:border-darkblack-300">
                      {paymentInfo.document_url.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                          src={paymentInfo.document_url}
                          className="w-full h-64"
                          title="Document Preview"
                        />
                      ) : (
                        <img
                          src={paymentInfo.document_url}
                          alt="Payment Receipt"
                          className="w-full h-auto max-h-64 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      <div className="hidden items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm">{t('payments.previewNotAvailable')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    💰 {t('payments.amount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      {paymentInfo.contract?.currency || "HNL"}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-darkblack-400 rounded-xl bg-white dark:bg-darkblack-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Interest Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📈 {t('payments.lateInterest')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      {paymentInfo.contract?.currency || "HNL"}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={editInterest}
                      onChange={(e) => setEditInterest(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-darkblack-400 rounded-xl bg-white dark:bg-darkblack-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Total Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-darkblack-500 dark:to-darkblack-400 rounded-xl p-4 border-2 border-gray-200 dark:border-darkblack-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      💵 Total a Aprobar:
                    </span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {paymentInfo.contract?.currency || "HNL"} {(Number(editAmount) + Number(editInterest)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Approval Result */}
                {approvalResult && (
                  <div className={`rounded-xl p-4 border-2 ${
                    approvalResult.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        approvalResult.type === 'success'
                          ? 'bg-green-100 dark:bg-green-800/50'
                          : 'bg-red-100 dark:bg-red-800/50'
                      }`}>
                        {approvalResult.type === 'success' ? (
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          approvalResult.type === 'success'
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          {approvalResult.type === 'success' ? '¡Éxito!' : 'Error'}
                        </p>
                        <p className={`text-sm ${
                          approvalResult.type === 'success'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {approvalResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-darkblack-500 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setApprovalResult(null);
                  }}
                  className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-darkblack-600 border-2 border-gray-300 dark:border-darkblack-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkblack-700 transition-all shadow-sm hover:shadow"
                >
                  ✕ {t('common.cancel')}
                </button>
                {!approvalResult?.type && (
                  <button
                    onClick={handleApprove}
                    disabled={approveLoading}
                    className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg flex items-center gap-2"
                  >
                    {approveLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{t('common.processing')}</span>
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>{t('payments.approve')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </td>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((s) => ({ ...s, visible: false }))} />
    </>
  );
}

PaymentItem.propTypes = {
  paymentInfo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    due_date: PropTypes.string,
    payment_date: PropTypes.string,
    status: PropTypes.string,
    interest_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    contract: PropTypes.shape({
      currency: PropTypes.string,
      lot: PropTypes.shape({
        name: PropTypes.string,
        address: PropTypes.string,
      }),
      applicant_user: PropTypes.shape({
        full_name: PropTypes.string,
        phone: PropTypes.string,
        identity: PropTypes.string,
      }),
    }),
  }).isRequired,
  index: PropTypes.number,
  userRole: PropTypes.string,
  refreshPayments: PropTypes.func,
  onClick: PropTypes.func,
  isMobileCard: PropTypes.bool,
};

export default PaymentItem;
