import PropTypes from "prop-types";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";
import { formatStatus } from "../../../utils/formatStatus";
import { useContext, useState } from 'react';
import AuthContext from '../../../context/AuthContext';
import { useLocale } from "../../../contexts/LocaleContext";

function PaymentInfo({
  description,
  amount,
  due_date,
  interest_amount,
  status,
  payment_id,
  userRole,
  refreshPayments,
  currency,
  applicant_name,
  applicant_phone,
  applicant_identity,
  lot_name,
  lot_address,
}) {
  const token = getToken();
  const { user } = useContext(AuthContext) || {};
  const currentUserRole = user?.role;
  const { t } = useLocale();

  const statusLower = (status || '').toLowerCase();
  const statusLabel = statusLower === 'submitted' ? t('payments.statusOptions.submitted') :
                     statusLower === 'paid' ? t('payments.statusOptions.paid') :
                     formatStatus(status, t);

  const isOverdue = due_date ? (new Date(due_date).getTime() < Date.now()) && statusLower !== 'paid' : false;
  const totalAmount = Number(amount || 0) + Number(interest_amount || 0);

  // Utility function to mask identity card
  const maskIdentity = (identity) => {
    if (!identity) return "N/A";
    const str = String(identity);
    if (str.length <= 4) return str;
    return str.slice(0, 4) + "*".repeat(str.length - 4);
  };

  // Modal state for approve confirmation
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [editAmount, setEditAmount] = useState(amount);
  const [editInterest, setEditInterest] = useState(interest_amount);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // UPLOAD RECEIPT endpoint: /api/v1/payments/:id/upload_receipt
  // upload removed: handled in the dedicated upload screen

  // APPROVE endpoint: /api/v1/payments/:id/approve
  async function handleApprove() {
    setApproveLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/payments/${payment_id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: editAmount,
          interest_amount: editInterest
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.errors.join(" ") || t('payments.approveError'));
      }
      if (typeof refreshPayments === "function") {
        refreshPayments({ page: 1 });
      }
      setShowApproveModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setApproveLoading(false);
    }
  }

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/payments/${payment_id}/download_receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(t('payments.downloadReceiptError'));
      }
  
      const blob = await response.blob();
  
      // Determine file extension based on blob MIME type.
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
        case "application/msword":
          extension = ".doc";
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          extension = ".docx";
          break;
        // Add other MIME types as needed.
        default:
          // Optionally, you could try to extract a filename from response headers here
          extension = "";
      }
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-pago-${payment_id}${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  const handlePreviewReceipt = async () => {
    setPreviewLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/payments/${payment_id}/download_receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(t('payments.fetchReceiptError'));
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <tr className="border-b border-bgray-300 dark:border-darkblack-400">
      {/* Description */}
      <td className="px-6 py-5 xl:px-0">
        <div className="space-y-1">
          <p className="text-base font-semibold text-bgray-900 dark:text-white">
            {description || t('common.notAvailable')}
          </p>
          {lot_name && (
            <p className="text-sm text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
              <span className="text-blue-600">🏠</span>
              <span>{lot_name}</span>
            </p>
          )}
          {lot_address && (
            <p className="text-sm text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
              <span className="text-gray-600">📍</span>
              <span>{lot_address}</span>
            </p>
          )}
        </div>
      </td>

      {/* Solicitante - Merged information */}
      <td className="px-6 py-5 xl:px-0">
        <div className="space-y-1">
          <p className="text-base font-semibold text-bgray-900 dark:text-white">
            {applicant_name || t('common.notAvailable')}
          </p>
          {applicant_phone && (
            <p className="text-sm text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
              <span className="text-green-600">📞</span>
              <span>{applicant_phone}</span>
            </p>
          )}
          {applicant_identity && (
            <p className="text-sm text-bgray-500 dark:text-bgray-400 flex items-center gap-1">
              <span className="text-blue-600">🆔</span>
              <span className="font-mono">{maskIdentity(applicant_identity)}</span>
            </p>
          )}
        </div>
      </td>

      {/* Amount + Interest merged and total */}
      <td className="px-6 py-5 xl:px-0">
        <div>
          <p className="text-base font-semibold text-bgray-900 dark:text-white">
            {totalAmount.toLocaleString()} {currency}
          </p>
          {interest_amount > 0 && (
            <p className="text-sm text-bgray-500 dark:text-bgray-400">
              {t('payments.base')}: {Number(amount).toLocaleString()} {currency}
            </p>
          )}
          {interest_amount > 0 && (
            <p className="text-sm text-orange dark:text-orange">
              + {Number(interest_amount).toLocaleString()} {currency}
            </p>
          )}
        </div>
      </td>

      {/* Due Date with overdue flag */}
      <td className="px-6 py-5 xl:px-0">
        <div>
          <p className={`text-base font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-bgray-900 dark:text-white'}`}>
            {due_date ? new Date(due_date).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            }) : t('common.notAvailable')}
          </p>
          {isOverdue && (
            <span className="inline-block mt-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 text-xs font-medium">
              {t('payments.overdue')}
            </span>
          )}
        </div>
      </td>

      {/* Status (translated + dark mode fixes) */}
      <td className="px-6 py-5 xl:px-0">
        <div className="flex w-full items-center">
          <span className={`block rounded-md px-4 py-1.5 text-sm font-semibold leading-[22px] ${
            statusLower === 'submitted' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
            statusLower === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
          }`}>
            {statusLabel}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-5 xl:px-0">
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {/* Upload button removed from this list view */}

          {/* Download Receipt (admin) */}
          {currentUserRole === "admin" && (statusLower === "paid" || statusLower === "submitted") && (
            <button
              onClick={handleDownloadReceipt}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-150 shadow-sm"
              title={t('payments.downloadReceipt')}
            >
              📁
            </button>
          )}

          {/* Approve Button (admin) */}
          {currentUserRole === "admin" && statusLower === "submitted" && (
            <>
              <button
                onClick={() => setShowApproveModal(true)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors duration-150 shadow-sm"
                title={t('payments.approvePayment')}
              >
                ✓
              </button>
              {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-darkblack-600 rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-2 text-bgray-900 dark:text-white">{t('payments.confirmApproval')}</h3>
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between items-center text-bgray-700 dark:text-bgray-200">
                        <label htmlFor="approve-amount" className="mr-2">{t('payments.amount')}:</label>
                        <input
                          id="approve-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 px-2 py-1 rounded border border-bgray-300 dark:border-darkblack-400 bg-bgray-50 dark:bg-darkblack-400 text-right text-bgray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                          value={editAmount}
                          onChange={e => setEditAmount(e.target.value)}
                          disabled={approveLoading}
                        />
                        <span className="ml-1">{currency}</span>
                      </div>
                      <div className="flex justify-between items-center text-bgray-700 dark:text-bgray-200">
                        <label htmlFor="approve-interest" className="mr-2">{t('payments.interest')}:</label>
                        <input
                          id="approve-interest"
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 px-2 py-1 rounded border border-bgray-300 dark:border-darkblack-400 bg-bgray-50 dark:bg-darkblack-400 text-right text-bgray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                          value={editInterest}
                          onChange={e => setEditInterest(e.target.value)}
                          disabled={approveLoading}
                        />
                        <span className="ml-1">{currency}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-2 text-bgray-900 dark:text-white">
                        <span>{t('payments.total')}:</span>
                        <span>{(Number(editAmount || 0) + Number(editInterest || 0)).toLocaleString()} {currency}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <button
                        onClick={handlePreviewReceipt}
                        className="px-3 py-1.5 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
                        disabled={previewLoading || approveLoading}
                      >
                        {previewLoading ? t('common.loading') : t('payments.previewReceipt')}
                      </button>
                      {previewUrl && (
                        <div className="mt-2">
                          <iframe
                            src={previewUrl}
                            className="w-full h-64 border border-bgray-300 dark:border-darkblack-400 rounded"
                            title={t('payments.previewReceipt')}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => {
                          setShowApproveModal(false);
                          if (previewUrl) {
                            window.URL.revokeObjectURL(previewUrl);
                            setPreviewUrl(null);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded bg-bgray-200 dark:bg-darkblack-400 text-bgray-800 dark:text-bgray-100 hover:bg-bgray-300 dark:hover:bg-darkblack-300"
                        disabled={approveLoading}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={handleApprove}
                        className="px-3 py-1.5 text-xs font-medium rounded bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 disabled:opacity-60"
                        disabled={approveLoading}
                      >
                        {approveLoading ? t('payments.approving') : t('common.confirm')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Undo action - revert approval (admin) */}
          {currentUserRole === "admin" && statusLower === "paid" && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${API_URL}/api/v1/payments/${payment_id}/undo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  });
                  if (!res.ok) throw new Error('Error undoing approval');
                  refreshPayments({ page: 1 });
                } catch (err) {
                  alert(t('payments.undoApprovalError'));
                }
              }}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-150 shadow-sm"
              title={t('payments.undoApproval')}
            >
              ↺
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

PaymentInfo.propTypes = {
  description: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  due_date: PropTypes.string.isRequired,
  interest_amount: PropTypes.string,
  status: PropTypes.string.isRequired,
  payment_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userRole: PropTypes.string.isRequired,
  refreshPayments: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  applicant_name: PropTypes.string,
  applicant_phone: PropTypes.string,
  applicant_identity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lot_name: PropTypes.string,
  lot_address: PropTypes.string,
};

export default PaymentInfo;
