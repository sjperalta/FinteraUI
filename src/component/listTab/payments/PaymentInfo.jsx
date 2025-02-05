import PropTypes from "prop-types";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";
import { formatStatus } from "../../../utils/formatStatus";

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
}) {
  const token = getToken();

  // UPLOAD RECEIPT endpoint: /api/v1/payments/:id/upload_receipt
  const handleUploadReceipt = async () => {
    if (!payment_id) {
      alert("No payment_id available for uploading a receipt.");
      return;
    }

    try {
      // Replace this with a file input for a real receipt
      const receipt = new Blob(["Dummy receipt content"], { type: "text/plain" });

      const formData = new FormData();
      formData.append("receipt", receipt);

      const response = await fetch(`${API_URL}/api/v1/payments/${payment_id}/upload_receipt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error uploading receipt");
      }

      alert("Comprobante subido exitosamente.");
      refreshPayments({});
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  // APPROVE endpoint: /api/v1/payments/:id/approve
  const handleApprove = async () => {
    if (!payment_id) {
      alert("No payment_id available to approve.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/payments/${payment_id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error approving payment.");
      }

      alert("Pago aprobado exitosamente.");
      refreshPayments({});
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/payments/${payment_id}/download_receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Error downloading receipt');
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

  return (
    <tr className="border-b border-bgray-300 dark:border-darkblack-400">
      {/* Description */}
      <td className="px-6 py-5 xl:w-[165px] xl:px-0">
        <p className="text-base font-semibold text-bgray-900 dark:text-white">
          {description || "N/A"}
        </p>
      </td>

      {/* Amount */}
      <td className="px-6 py-5 xl:w-[165px] xl:px-0">
        <p className="text-base font-medium text-bgray-900 dark:text-white">
          {Number(amount).toLocaleString()} {currency}
        </p>
      </td>

      {/* Due Date */}
      <td className="px-6 py-5 xl:w-[165px] xl:px-0">
        <p className="text-base font-medium text-bgray-900 dark:text-white">
          {new Date(due_date).toLocaleDateString()}
        </p>
      </td>

      {/* Interest Amount */}
      <td className="px-6 py-5 xl:w-[165px] xl:px-0">
        <p className="text-base font-medium text-bgray-900 dark:text-white">
          {interest_amount > 0 ? `${Number(interest_amount).toLocaleString()} ${currency}` : "N/A"}
        </p>
      </td>

      {/* Status */}
      <td className="px-6 py-5 xl:w-[165px] xl:px-0">
        <div className="flex w-full items-center">
          <span
            className={`block rounded-md bg-success-50 px-4 py-1.5 text-sm font-semibold leading-[22px] ${
              status?.toLowerCase() === "pending"
                ? "bg-yellow-100"
                : status?.toLowerCase() === "paid"
                ? "bg-green-100"
                : "bg-red-100"
            } dark:bg-darkblack-500`}
          >
            {formatStatus(status?.toLowerCase())}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-5 xl:w-[165px] xl:px-0">
        <div className="flex items-center gap-4">
          {/* Upload Receipt Button */}
          {userRole === "admin" && status?.toLowerCase() === "pending" && (
            <button
              onClick={handleUploadReceipt}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
            >
              Subir
            </button>
          )}
          {/* Approve Button */}
          {userRole === "admin" && (status?.toLowerCase() === "paid" || status?.toLowerCase() === "submitted") && (
            <button
              onClick={handleDownloadReceipt}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
            >
              Descargar
            </button>
          )}
          {/* Approve Button */}
          {userRole === "admin" && status?.toLowerCase() === "submitted" && (
            <button
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
            >
              Aprobar
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
  currency: PropTypes.string.isRequired
};

export default PaymentInfo;
