import PropTypes from "prop-types";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";
import { formatStatus } from "../../../utils/formatStatus";

/**
 * Translates the financing type to Spanish.
 * @param {string} type - The financing type (direct, cash, bank).
 * @returns {string} - The translated type.
 */
const translateFinancingType = (type) => {
    switch (type?.toLowerCase()) {
        case "direct":
            return "Directo";
        case "cash":
            return "Efectivo";
        case "bank":
            return "Bancario";
        default:
            return "N/A";
    }
};

function ContractInfo({
    customer_name,
    created_by,
    lot_name,
    balance,
    financing_type,
    reserve_amount,
    status,
    created_at,
    project_id,
    lot_id,
    contract_id,
    userRole,
    refreshContracts,
}) {
    const token = getToken();

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

    return (
        <tr className="border-b border-bgray-300 dark:border-darkblack-400">
            {/* Customer Name */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <p className="text-base font-semibold text-bgray-900 dark:text-white">
                    {customer_name || "N/A"}
                </p>
            </td>

            {/* Lot Name */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <p className="text-base font-medium text-bgray-900 dark:text-white">
                    {lot_name || "N/A"}
                </p>
            </td>

            {/* Balance */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <p className="text-base font-medium text-bgray-900 dark:text-white">
                    {balance} HNL
                </p>
            </td>

            {/* Financing Type */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <p className="text-base font-medium text-bgray-900 dark:text-white">
                    {translateFinancingType(financing_type)}
                </p>
            </td>

            {/* Reserve Amount */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <p className="text-base font-medium text-bgray-900 dark:text-white">
                    {reserve_amount} HNL
                </p>
            </td>

            {/* Status */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <div className="flex w-full items-center">
                <span
                    className={`block rounded-md bg-success-50 px-4 py-1.5 text-sm font-semibold leading-[22px] ${
                    status?.toLowerCase() === "pending" ||  status?.toLowerCase() === "approved" ? "bg-blue-100" : "bg-red-100"
                    }  dark:bg-darkblack-500`}
                >
                    {formatStatus(status?.toLowerCase())}
                </span>
                </div>
            </td>

            {/* Created At */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <p className="text-base font-medium text-bgray-900 dark:text-white">
                    {new Date(created_at).toLocaleDateString()}
                </p>
            </td>

             {/* Created By */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <p className="text-base font-semibold text-bgray-900 dark:text-white">
                    {created_by || "N/A"}
                </p>
            </td>

            {/* Action Buttons */}
            <td className="px-6 py-5 xl:w-[165px] xl:px-0">
                <div className="flex items-center gap-4">
                    {/* APPROVE button for admin */}
                    {userRole === "admin" && status?.toLowerCase() === "pending" && (
                        <button
                            onClick={handleApprove}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
                        >
                            Aprobar
                        </button>
                    )}

                    {/* REJECT button for admin */}
                    {userRole === "admin" && status?.toLowerCase() === "approved" && (
                        <button
                            onClick={handleReject}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                        >
                            Rechazar
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

ContractInfo.propTypes = {
    customer_name: PropTypes.string.isRequired,
    lot_name: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    financing_type: PropTypes.string.isRequired,
    reserve_amount: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lot_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    contract_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userRole: PropTypes.string.isRequired,
    refreshContracts: PropTypes.func.isRequired,
};

export default ContractInfo;