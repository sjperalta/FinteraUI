import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { formatStatus } from "../../utils/formatStatus";
import { useLocale } from "../../contexts/LocaleContext";
import { useToast } from "../../contexts/ToastContext";
import DocumentSelect from "../forms/ReportSelect";
import PaymentScheduleModal from "./PaymentScheduleModal";
import RejectionModal from "./RejectionModal";
import ContractDetailsModal from "./ContractDetailsModal";
import { createPortal } from "react-dom";

// Translate financing type to Spanish
const translateFinancingType = (type) => {
  switch (type?.toLowerCase()) {
    case "direct":
      return "Directo";
    case "cash":
      return "Contado";
    case "bank":
      return "Bancario";
    default:
      return "N/A";
  }
};

// Badge class for financing type
const financingTypeClass = (type) => {
  switch (type?.toLowerCase()) {
    case "direct":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "bank":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "cash":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

// Badge class for status
const statusClass = (status) => {
  const s = status?.toLowerCase();
  if (s === "pending")
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  if (s === "submitted")
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  if (s === "approved")
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (s === "rejected")
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (s === "closed")
    return "bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-200";
  if (s === "canceled" || s === "cancelled")
    return "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
};

const formatCurrency = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return v;
  return (
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " HNL"
  );
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function ContractItem({
  contract,
  userRole,
  refreshContracts,
  isMobileCard = false,
}) {
  const { showToast } = useToast();
  const token = getToken();
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { t } = useLocale();

  // Navigation handlers
  const handleNavigateToClient = (e) => {
    e.stopPropagation();
    navigate("/users", {
      state: {
        selectedUserId: contract.applicant_identity,
        selectedUserName: contract.applicant_name,
        selectedUserPhone: contract.applicant_phone,
      },
    });
  };

  const handleNavigateToLot = (e) => {
    e.stopPropagation();
    if (contract.project_id) {
      navigate(`/projects/${contract.project_id}/lots`, {
        state: {
          selectedLotId: contract.lot_id,
          selectedLotName: contract.lot_name,
          selectedLotAddress: contract.lot_address,
        },
      });
    }
  };

  // APPROVE endpoint
  const handleApprove = async (e) => {
    e?.stopPropagation();
    if (!contract.id) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error aprobando el contrato.");
      showToast("Contrato aprobado exitosamente.", "success");
      refreshContracts();
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // REJECT endpoint
  const handleReject = async (reason) => {
    if (!contract.id) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );
      if (!response.ok) throw new Error("Error rechazando el contrato.");
      showToast("Contrato rechazado exitosamente.", "success");
      setShowRejectionModal(false);
      refreshContracts();
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // CANCEL endpoint
  const handleCancel = async (e) => {
    e?.stopPropagation();
    if (!contract.id) return;
    if (!window.confirm("¿Está seguro de que desea cancelar este contrato?"))
      return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error cancelando el contrato.");
      showToast("Contrato cancelado exitosamente.", "success");
      refreshContracts();
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };
  
  // Mobile Card View
  if (isMobileCard) {
    return (
      <div className="space-y-4">
        {/* Lote Section */}
        <div
          onClick={handleNavigateToLot}
          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-darkblack-500 rounded-lg p-3 -m-3 transition-colors"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">🏠</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-bgray-900 dark:text-white truncate">
                {contract.lot_name || "N/A"}
              </p>
              {contract.project_name && (
                <p className="text-xs text-bgray-500 dark:text-bgray-300 truncate">
                  🏢 {contract.project_name}
                </p>
              )}
              {contract.lot_address && (
                <p className="text-xs text-bgray-500 dark:text-bgray-300 truncate">
                  📍 {contract.lot_address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cliente Section */}
        <div
          onClick={handleNavigateToClient}
          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-darkblack-500 rounded-lg p-3 -m-3 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {contract.applicant_name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-bgray-900 dark:text-white truncate">
                {contract.applicant_name || "N/A"}
              </p>
              {contract.applicant_identity && (
                <p className="text-xs text-bgray-500 dark:text-bgray-300 font-mono">
                  ID: {contract.applicant_identity}
                </p>
              )}
              {contract.applicant_phone && (
                <p className="text-xs text-bgray-500 dark:text-bgray-300">
                  📞 {contract.applicant_phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-bgray-500 dark:text-bgray-400 mb-1">
              {t("contracts.financing")}
            </p>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${financingTypeClass(
                contract.financing_type
              )}`}
            >
              💳 {translateFinancingType(contract.financing_type)}
            </span>
          </div>
          <div>
            <p className="text-xs text-bgray-500 dark:text-bgray-400 mb-1">
              {t("contracts.statusLabel")}
            </p>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusClass(
                contract.status
              )}`}
            >
              {formatStatus(contract.status?.toLowerCase(), t)}
            </span>
          </div>
          <div>
            <p className="text-xs text-bgray-500 dark:text-bgray-400 mb-1">
              {t("contracts.created")}
            </p>
            <p className="text-sm font-medium text-bgray-900 dark:text-white">
              {formatDate(contract.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-bgray-500 dark:text-bgray-400 mb-1">
              {t("contracts.createdBy")}
            </p>
            <p className="text-sm font-medium text-bgray-900 dark:text-white">
              {contract.created_by || "N/A"}
            </p>
          </div>
        </div>

        {/* Rejection Reason */}
        {contract.status?.toLowerCase() === "rejected" &&
          contract.rejection_reason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
              <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                {t("contracts.rejectionReason")}:
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {contract.rejection_reason}
              </p>
            </div>
          )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-200 dark:border-darkblack-400">
          {userRole === "admin" &&
            (contract.status?.toLowerCase() === "pending" ||
              contract.status?.toLowerCase() === "submitted" ||
              contract.status?.toLowerCase() === "rejected") && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg disabled:opacity-50"
              >
                ✅ {t("contracts.approve")}
              </button>
            )}

          {userRole === "admin" &&
            (contract.status?.toLowerCase() === "pending" ||
              contract.status?.toLowerCase() === "submitted") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRejectionModal(true);
                }}
                disabled={actionLoading}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50"
              >
                ❌ {t("contracts.reject")}
              </button>
            )}

          {userRole === "admin" &&
            (contract.status?.toLowerCase() === "rejected" ||
              contract.status?.toLowerCase() === "pending" ||
              contract.status?.toLowerCase() === "submitted") && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg disabled:opacity-50"
              >
                🚫 {t("contracts.cancel")}
              </button>
            )}

          {userRole === "admin" &&
            (contract.status?.toLowerCase() === "approved" ||
              contract.status?.toLowerCase() === "closed") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSchedule(true);
                }}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                📅 {t("contracts.paymentSchedule")}
              </button>
            )}

          <div className="flex-shrink-0">
            <DocumentSelect
              contract_id={contract.id}
              financing_type={contract.financing_type}
              status={contract.status}
            />
          </div>

          {/* View Details Button - For submitted contracts, rejected contracts, for seller, admin users */}
          {(userRole === "admin" || userRole === "seller") &&
            (contract.status?.toLowerCase() === "submitted" ||
              contract.status?.toLowerCase() === "rejected") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailsModal(true);
                }}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg"
              >
                📋 {t("contracts.viewDetails")}
              </button>
            )}
        </div>

        {/* Modals */}
        {showSchedule &&
          createPortal(
            <PaymentScheduleModal
              contract={contract}
              open={showSchedule}
              onClose={() => setShowSchedule(false)}
            />,
            document.body
          )}

        <RejectionModal
          isOpen={showRejectionModal}
          onClose={() => setShowRejectionModal(false)}
          onSubmit={handleReject}
          loading={actionLoading}
        />

        <ContractDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          contract={contract}
        />
      </div>
    );
  }

  // Desktop Table Row View - Return only <td> elements
  return (
    <>
      {/* Lote (Name + Address) - Clickable */}
      <td className="px-6 py-5">
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
                {contract.lot_name || "N/A"}
              </p>
              {contract.project_name && (
                <p className="text-xs text-bgray-500 dark:text-bgray-300 truncate">
                  🏢 {contract.project_name}
                </p>
              )}
              {contract.lot_address && (
                <p className="text-sm text-bgray-500 dark:text-bgray-300 truncate">
                  📍 {contract.lot_address}
                </p>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Cliente (Name + Phone + Identity) - Clickable */}
      <td className="px-6 py-5">
        <div
          onClick={handleNavigateToClient}
          className="cursor-pointer hover:bg-bgray-50 dark:hover:bg-darkblack-500 rounded-lg p-2 -m-2 transition-colors group"
        >
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {contract.applicant_name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-bgray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {contract.applicant_name || "N/A"}
              </p>
              {contract.applicant_identity && (
                <p className="text-xs text-bgray-500 dark:text-bgray-300 font-mono">
                  ID: {contract.applicant_identity}
                </p>
              )}
              {contract.applicant_phone && (
                <p className="text-sm text-bgray-500 dark:text-bgray-300">
                  📞 {contract.applicant_phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Financiamiento */}
      <td className="px-6 py-5">
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold shadow-sm ${financingTypeClass(
              contract.financing_type
            )}`}
          >
            <span className="mr-1">💳</span>
            {translateFinancingType(contract.financing_type)}
          </span>
        </div>
      </td>

      {/* Status (with rejection reason) */}
      <td className="px-6 py-5">
        <div className="space-y-2">
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${statusClass(
                contract.status
              )}`}
            >
              {contract.status?.toLowerCase() === "approved" && "✅"}
              {contract.status?.toLowerCase() === "rejected" && "❌"}
              {contract.status?.toLowerCase() === "pending" && "⏳"}
              {contract.status?.toLowerCase() === "submitted" && "📋"}
              {(contract.status?.toLowerCase() === "cancelled" ||
                contract.status?.toLowerCase() === "canceled") &&
                "🚫"}
              {contract.status?.toLowerCase() === "closed" && "🔒"}
              <span className="ml-1">
                {formatStatus(contract.status?.toLowerCase(), t)}
              </span>
            </span>
          </div>

          {contract.status?.toLowerCase() === "rejected" &&
            contract.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                  {t("contracts.rejectionReason")}:
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {contract.rejection_reason}
                </p>
              </div>
            )}
        </div>
      </td>

      {/* Creado */}
      <td className="px-6 py-5">
        <div className="text-center">
          <p className="text-sm font-medium text-bgray-900 dark:text-white">
            {formatDate(contract.created_at)}
          </p>
        </div>
      </td>

      {/* Creado Por */}
      <td className="px-6 py-5">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">👤</span>
            </div>
            <p className="text-sm font-semibold text-bgray-900 dark:text-white">
              {contract.created_by || "N/A"}
            </p>
          </div>
        </div>
      </td>

      {/* Acciones */}
      <td className="px-6 py-5">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {userRole === "admin" &&
            (contract.status?.toLowerCase() === "pending" ||
              contract.status?.toLowerCase() === "submitted" ||
              contract.status?.toLowerCase() === "rejected") && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <span className="mr-1">✅</span>
                {actionLoading ? "..." : t("contracts.approve")}
              </button>
            )}

          {userRole === "admin" &&
            (contract.status?.toLowerCase() === "pending" ||
              contract.status?.toLowerCase() === "submitted") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRejectionModal(true);
                }}
                disabled={actionLoading}
                className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <span className="mr-1">❌</span>
                {actionLoading ? "..." : t("contracts.reject")}
              </button>
            )}

          {userRole === "admin" &&
            (contract.status?.toLowerCase() === "rejected" ||
              contract.status?.toLowerCase() === "pending" ||
              contract.status?.toLowerCase() === "submitted") && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <span className="mr-1">🚫</span>
                {actionLoading ? "..." : t("contracts.cancel")}
              </button>
            )}

          {userRole === "admin" &&
            (contract.status?.toLowerCase() === "approved" ||
              contract.status?.toLowerCase() === "closed") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSchedule(true);
                }}
                className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="mr-1">📅</span>
                {t("contracts.paymentSchedule")}
              </button>
            )}

          <div className="flex items-center">
            <DocumentSelect
              contract_id={contract.id}
              financing_type={contract.financing_type}
              status={contract.status}
            />
          </div>

          {(userRole === "admin" || userRole === "seller") &&
            (contract.status?.toLowerCase() === "pending" ||
              contract.status?.toLowerCase() === "submitted" ||
              contract.status?.toLowerCase() === "rejected") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailsModal(true);
                }}
                className="group relative inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="mr-1">📋</span>
                {t("contracts.viewDetails")}
              </button>
            )}
        </div>
      </td>

      {/* Modals */}
      {showSchedule &&
        createPortal(
          <PaymentScheduleModal
            contract={contract}
            open={showSchedule}
            onClose={() => setShowSchedule(false)}
          />,
          document.body
        )}

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleReject}
        loading={actionLoading}
      />

      <ContractDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        contract={contract}
      />

    </>
  );
}

ContractItem.propTypes = {
  contract: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    applicant_name: PropTypes.string,
    applicant_phone: PropTypes.string,
    applicant_identity: PropTypes.string,
    applicant_credit_score: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    created_by: PropTypes.string,
    approved_at: PropTypes.string,
    lot_name: PropTypes.string,
    lot_address: PropTypes.string,
    balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    financing_type: PropTypes.string,
    down_payment: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_term: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reserve_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    project_name: PropTypes.string,
    project_address: PropTypes.string,
    rejection_reason: PropTypes.string,
    note: PropTypes.string,
    created_at: PropTypes.string,
    project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lot_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_schedule: PropTypes.array,
  }).isRequired,
  userRole: PropTypes.string.isRequired,
  refreshContracts: PropTypes.func.isRequired,
  isMobileCard: PropTypes.bool,
};

export default ContractItem;
