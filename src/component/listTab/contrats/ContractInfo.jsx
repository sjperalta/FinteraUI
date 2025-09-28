import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";
import { formatStatus } from "../../../utils/formatStatus";
import DocumentSelect from "../../forms/ReportSelect";
import PaymentScheduleModal from "../../contracts/PaymentScheduleModal";
import { createPortal } from "react-dom";

// Translate financing type to Spanish
const translateFinancingType = (type) => {
  switch (type?.toLowerCase()) {
    case "direct": return "Directo";
    case "cash": return "Contado";
    case "bank": return "Bancario";
    default: return "N/A";
  }
};

// Badge class for financing type
const financingTypeClass = (type) => {
  switch (type?.toLowerCase()) {
    case "direct": return "bg-green-100 text-green-700";
    case "bank": return "bg-blue-100 text-blue-700";
    case "cash": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

// Badge class for status
const statusClass = (status) => {
  const s = status?.toLowerCase();
  if (s === "pending") return "bg-yellow-100 text-yellow-700";
  if (s === "submitted") return "bg-blue-100 text-blue-700";
  if (s === "approved") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  if (s === "closed") return "bg-gray-800 text-white";
  if (s === "canceled" || s === "cancelled") return "bg-gray-200 text-gray-600";
  return "bg-gray-100 text-gray-600";
};

const formatCurrency = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return v;
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " HNL";
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

// Rejection Reason Modal Component
const RejectionModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Por favor ingrese una razón para el rechazo.");
      return;
    }
    onSubmit(reason);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-darkblack-600 rounded-lg shadow-xl mx-4">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-bgray-200 dark:border-darkblack-400">
          <div>
            <h3 className="text-lg font-bold text-bgray-900 dark:text-white">Rechazar Contrato</h3>
            <p className="text-sm text-bgray-500 dark:text-bgray-300 mt-1">
              Proporcione una razón para el rechazo del contrato
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-bgray-500 hover:text-bgray-700 dark:text-bgray-300 dark:hover:text-white"
            aria-label="Cerrar"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Razón del rechazo *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white resize-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
              rows="4"
              placeholder="Ingrese la razón por la cual se rechaza este contrato..."
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-bgray-200 hover:bg-bgray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-bgray-800 dark:text-bgray-100"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              disabled={loading || !reason.trim()}
            >
              {loading ? "Rechazando..." : "Rechazar Contrato"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

function ContractInfo({
  applicant_name,
  applicant_phone,
  applicant_identity,
  applicant_credit_score,
  created_by,
  approved_at,
  balance,
  amount, 
  payment_term,
  financing_type,
  reserve_amount,
  down_payment,
  status,
  note,
  rejection_reason,
  cancellation_notes,
  created_at,
  project_id,
  payment_schedule,
  lot_id,
  lot_name,
  lot_address,
  contract_id,
  userRole,
  project_name,
  project_address,
  refreshContracts,
}) {
  const token = getToken();
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Navigation handlers
  const handleNavigateToClient = () => {
    // Navigate to users page with the selected user information
    // We'll pass the user info through the navigation state
    navigate('/users', { 
      state: { 
        selectedUserId: applicant_identity,
        selectedUserName: applicant_name,
        selectedUserPhone: applicant_phone 
      } 
    });
  };

  const handleNavigateToLot = () => {
    // Navigate to the specific project's lots page with lot filtering
    if (project_id) {
      navigate(`/projects/${project_id}/lots`, {
        state: {
          selectedLotId: lot_id,
          selectedLotName: lot_name,
          selectedLotAddress: lot_address
        }
      });
    } else {
      console.error('No project_id available for navigation');
    }
  };

  // APPROVE endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/approve
  const handleApprove = async () => {
    if (!contract_id) {
      alert("No contract_id available to approve.");
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}/contracts/${contract_id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error aprobando el contrato.");
      }
      alert("Contrato aprobado exitosamente.");
      refreshContracts({});
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  // REJECT endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/reject
  const handleReject = async (reason) => {
    if (!contract_id) {
      alert("No contract_id available to reject.");
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}/contracts/${contract_id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: reason
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error rechazando el contrato.");
      }
      alert("Contrato rechazado exitosamente.");
      setShowRejectionModal(false);
      refreshContracts({});
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  // CANCEL endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/cancel
  const handleCancel = async () => {
    if (!contract_id) {
      alert("No contract_id available to cancel.");
      return;
    }
    
    if (!window.confirm("¿Está seguro de que desea cancelar este contrato? Esta acción no se puede deshacer.")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}/contracts/${contract_id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error cancelando el contrato.");
      }
      alert("Contrato cancelado exitosamente.");
      refreshContracts({});
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <tr className="border-b border-bgray-300 dark:border-darkblack-400">
        {/* Cliente (Name + Phone + Identity) - Clickable */}
        <td className="px-6 py-5 xl:w-[220px] xl:px-0">
          <div 
            onClick={handleNavigateToClient}
            className="cursor-pointer hover:bg-bgray-50 dark:hover:bg-darkblack-500 rounded-lg p-2 -m-2 transition-colors group"
          >
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {applicant_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-bgray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {applicant_name || "N/A"}
                </p>
                {applicant_identity && (
                  <p className="text-xs text-bgray-500 dark:text-bgray-300 font-mono">
                    ID: {applicant_identity}
                  </p>
                )}
                {applicant_phone && (
                  <p className="text-sm text-bgray-500 dark:text-bgray-300">
                    📞 {applicant_phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* Lote (Name + Address) - Clickable */}
        <td className="px-6 py-5 xl:w-[220px] xl:px-0">
          <div 
            onClick={handleNavigateToLot}
            className="cursor-pointer hover:bg-bgray-50 dark:hover:bg-darkblack-500 rounded-lg p-2 -m-2 transition-colors group"
          >
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🏠</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-bgray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                  {lot_name || "N/A"}
                </p>
                {project_name && (
                  <p className="text-xs text-bgray-500 dark:text-bgray-300 truncate">
                    🏢 {project_name}
                  </p>
                )}
                {lot_address && (
                  <p className="text-sm text-bgray-500 dark:text-bgray-300 truncate">
                    📍 {lot_address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* Financiamiento */}
        <td className="px-6 py-5 xl:w-[140px] xl:px-0">
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold shadow-sm ${financingTypeClass(financing_type)}`}>
              <span className="mr-1">💳</span>
              {translateFinancingType(financing_type)}
            </span>
          </div>
        </td>

        {/* Status (with rejection reason or cancellation notes) */}
        <td className="px-6 py-5 xl:w-[200px] xl:px-0">
          <div className="space-y-2">
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${statusClass(status)}`}
              >
                {status?.toLowerCase() === "approved" && "✅"}
                {status?.toLowerCase() === "rejected" && "❌"}
                {status?.toLowerCase() === "pending" && "⏳"}
                {status?.toLowerCase() === "submitted" && "📋"}
                {(status?.toLowerCase() === "cancelled" || status?.toLowerCase() === "canceled") && "🚫"}
                {status?.toLowerCase() === "closed" && "🔒"}
                <span className="ml-1">{formatStatus(status?.toLowerCase())}</span>
              </span>
            </div>
            
            {/* Show rejection reason if status is rejected */}
            {status?.toLowerCase() === "rejected" && rejection_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                  Razón del rechazo:
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {rejection_reason}
                </p>
              </div>
            )}

            {/* Show cancellation notes if status is cancelled */}
            {(status?.toLowerCase() === "cancelled" || status?.toLowerCase() === "canceled") && cancellation_notes && (
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-md p-2">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Notas de cancelación:
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {cancellation_notes}
                </p>
              </div>
            )}
          </div>
        </td>

        {/* Creado */}
        <td className="px-6 py-5 xl:w-[120px] xl:px-0">
          <div className="text-center">
            <p className="text-sm font-medium text-bgray-900 dark:text-white">
              {formatDate(created_at)}
            </p>
          </div>
        </td>

        {/* Creado Por */}
        <td className="px-6 py-5 xl:w-[140px] xl:px-0">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👤</span>
              </div>
              <p className="text-sm font-semibold text-bgray-900 dark:text-white">
                {created_by || "N/A"}
              </p>
            </div>
          </div>
        </td>

        {/* Acciones */}
        <td className="px-6 py-5 xl:w-[280px] xl:px-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* Approve Button - For pending, submitted, and rejected contracts */}
            {userRole === "admin" && 
              (status?.toLowerCase() === "pending" || 
               status?.toLowerCase() === "submitted" || 
               status?.toLowerCase() === "rejected") && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <span className="mr-1">✅</span>
                {actionLoading ? "..." : "Aprobar"}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity"></div>
              </button>
            )}

            {/* Reject Button - For pending and submitted contracts */}
            {userRole === "admin" &&
              (status?.toLowerCase() === "pending" ||
               status?.toLowerCase() === "submitted") && (
                <button
                  onClick={() => setShowRejectionModal(true)}
                  disabled={actionLoading}
                  className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <span className="mr-1">❌</span>
                  {actionLoading ? "..." : "Rechazar"}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity"></div>
                </button>
              )}

            {/* Cancel Button - For rejected, pending, and submitted contracts */}
            {userRole === "admin" && 
              (status?.toLowerCase() === "rejected" || 
               status?.toLowerCase() === "pending" || 
               status?.toLowerCase() === "submitted") && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <span className="mr-1">🚫</span>
                {actionLoading ? "..." : "Cancelar"}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity"></div>
              </button>
            )}

            {/* Payment Schedule Button - Only for approved contracts */}
            {userRole === "admin" && (status?.toLowerCase() === "approved" || status?.toLowerCase() === "closed") && (
              <button
                type="button"
                onClick={() => setShowSchedule(true)}
                className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="mr-1">📅</span>
                Plan de Pagos
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity"></div>
              </button>
            )}

            {/* Report Select */}
            <div className="flex items-center">
              <DocumentSelect contract_id={contract_id} financing_type={financing_type} status={status} />
            </div>
          </div>
        </td>
      </tr>

      {/* Payment Schedule Modal */}
      {showSchedule &&
        createPortal(
          <PaymentScheduleModal
            contract={{
              id: contract_id,
              applicant_name,
              applicant_credit_score,
              down_payment,
              payment_term,
              reserve_amount,
              financing_type,
              amount,
              balance,
              payment_schedule,
              created_at,
              approved_at,
              status,
              project_id,
              project_name,
              project_address,
              lot_id,
              lot_name,
              lot_address,
              note,
              rejection_reason,
              cancellation_notes,
            }}
            open={showSchedule}
            onClose={() => setShowSchedule(false)}
            onPaymentSuccess={(updatedPayment) => {
              // Optional: Update contract balance or other fields if needed
              // No need for full refresh - the modal handles its own state updates
            }}
          />,
          document.body
        )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleReject}
        loading={actionLoading}
      />
    </>
  );
}

ContractInfo.propTypes = {
  applicant_name: PropTypes.string.isRequired,
  applicant_phone: PropTypes.string,
  applicant_identity: PropTypes.string,
  applicant_credit_score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  created_by: PropTypes.string,
  lot_name: PropTypes.string.isRequired,
  lot_address: PropTypes.string,
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  payment_term: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  financing_type: PropTypes.string.isRequired,
  reserve_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  down_payment: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.string.isRequired,
  rejection_reason: PropTypes.string,
  cancellation_notes: PropTypes.string,
  created_at: PropTypes.string.isRequired,
  project_name: PropTypes.string,
  project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  payment_schedule: PropTypes.array,
  lot_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  contract_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userRole: PropTypes.string.isRequired,
  refreshContracts: PropTypes.func.isRequired,
};

export default ContractInfo;