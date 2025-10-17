import { useState } from "react";
import { createPortal } from "react-dom";
import Toast from "../ui/Toast";

const RejectionModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setToast({ visible: true, message: "Por favor ingrese una razón para el rechazo.", type: "error" });
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

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((s) => ({ ...s, visible: false }))}
      />
    </div>,
    document.body
  );
};

export default RejectionModal;