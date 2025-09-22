import PropTypes from "prop-types";
import { useState } from "react";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";
import { formatStatus } from "../../../utils/formatStatus";
import ReportSelect from "../../forms/ReportSelect";
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
  if (s === "pending" || s === "submitted") return "bg-yellow-100 text-yellow-700";
  if (s === "approved") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
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

function ContractInfo({
  applicant_name,
  created_by,
  lot_name,
  balance,
  amount, 
  payment_term,
  financing_type,
  reserve_amount,
  down_payment,
  status,
  created_at,
  project_id,
  payment_schedule,
  lot_id,
  contract_id,
  userRole,
  refreshContracts,
}) {
  const token = getToken();
  const [showSchedule, setShowSchedule] = useState(false);

  // APPROVE endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/approve
  const handleApprove = async () => {
    if (!contract_id) {
      alert("No contract_id available to approve.");
      return;
    }
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
        throw new Error("Error approving the contract.");
      }
      alert("Contrato aprobado exitosamente.");
      refreshContracts({});
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  // REJECT endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/reject
  const handleReject = async () => {
    if (!contract_id) {
      alert("No contract_id available to reject.");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}/contracts/${contract_id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error rejecting the contract.");
      }
      alert("Contrato rechazado exitosamente.");
      refreshContracts({});
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  // CANCEL endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/cancel
  const handleCancel = async () => {
    if (!contract_id) {
      alert("No contract_id available to cancel.");
      return;
    }
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
    }
  };

  // RELEASE endpoint: /api/v1/projects/:project_id/lots/:lot_id/contracts/:id/release
  const handleRelease = async () => {
    if (!contract_id) {
      alert("No contract_id available to release.");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}/contracts/${contract_id}/release`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error liberando el contrato.");
      }
      alert("Contrato liberado exitosamente.");
      refreshContracts({});
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <>
      <tr className="border-b border-bgray-300 dark:border-darkblack-400">
        {/* Cliente */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-0">
          <p className="text-base font-semibold text-bgray-900 dark:text-white">
            {applicant_name || "N/A"}
          </p>
        </td>

        {/* Lote */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-0">
          <p className="text-base font-medium text-bgray-900 dark:text-white">
            {lot_name || "N/A"}
          </p>
        </td>

        {/* Balance */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-0">
          <p className="text-base font-medium text-bgray-900 dark:text-white">
            {formatCurrency(balance)}
          </p>
        </td>

        {/* Financiamiento */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-0">
          <span className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${financingTypeClass(financing_type)} dark:bg-darkblack-500 dark:text-white`}>
            {translateFinancingType(financing_type)}
          </span>
        </td>

        {/* Reserva */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-0">
          <p className="text-base font-medium text-bgray-900 dark:text-white">
            {formatCurrency(reserve_amount)}
          </p>
        </td>

        {/* Status */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-0">
          <div className="flex w-full items-center">
            <span
              className={`block rounded-md px-4 py-1.5 text-sm font-semibold leading-[22px] ${statusClass(status)} dark:bg-darkblack-500`}
            >
              {formatStatus(status?.toLowerCase())}
            </span>
          </div>
        </td>

        {/* Creado */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-0">
          <p className="text-base font-medium text-bgray-900 dark:text-white">
            {formatDate(created_at)}
          </p>
        </td>

        {/* Creado Por */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-0">
          <p className="text-base font-semibold text-bgray-900 dark:text-white">
            {created_by || "N/A"}
          </p>
        </td>

        {/* Acciones */}
        <td className="px-6 py-5 xl:w-[165px] xl:px-2">
          <div className="flex items-center gap-3 flex-wrap">
            {userRole === "admin" && status?.toLowerCase() === "submitted" && (
              <button
                onClick={handleApprove}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs"
              >
                Aprobar
              </button>
            )}
            {userRole === "admin" &&
              (status?.toLowerCase() === "pending" ||
                status?.toLowerCase() === "submitted") && (
                <button
                  onClick={handleReject}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
                >
                  Rechazar
                </button>
              )}
            {userRole === "admin" && status?.toLowerCase() === "rejected" && (
              <button
                onClick={handleCancel}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-xs"
              >
                Cancelar
              </button>
            )}
            {userRole === "admin" && status?.toLowerCase() === "approved" && (
              <button
                onClick={handleRelease}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs"
              >
                Liberar
              </button>
            )}
            {userRole === "admin" && status?.toLowerCase() === "approved" && (
              <button
                type="button"
                onClick={() => setShowSchedule(true)}
                className="px-3 py-1 text-xs rounded bg-success-300 hover:bg-success-400 text-white"
              >
                Plan de Pagos
              </button>
            )}
            <div className="mt-1">
              <ReportSelect contract_id={contract_id} financing_type={financing_type} />
            </div>
          </div>
        </td>
      </tr>
      {showSchedule &&
        createPortal(
          <PaymentScheduleModal
            contract={{
              id: contract_id,
              applicant_name,
              down_payment,
              payment_term,
              reserve_amount,
              financing_type,
              amount,
              balance,
              project_id,
              lot_id,
              payment_schedule,
              created_at,
              status,
            }}
            open={showSchedule}
            onClose={() => setShowSchedule(false)}
          />,
          document.body
        )}
    </>
  );
}

ContractInfo.propTypes = {
  applicant_name: PropTypes.string.isRequired,
  created_by: PropTypes.string,
  lot_name: PropTypes.string.isRequired,
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  financing_type: PropTypes.string.isRequired,
  reserve_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  status: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  payment_schedule: PropTypes.array,
  lot_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  contract_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userRole: PropTypes.string.isRequired,
  refreshContracts: PropTypes.func.isRequired,
};

export default ContractInfo;