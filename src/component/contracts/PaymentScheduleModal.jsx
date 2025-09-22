import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

function PaymentScheduleModal({ contract, open, onClose }) {
  const [schedule, setSchedule] = useState([]);

  // Build synthetic schedule (fallback when no payment_schedule present)
  const buildSynthetic = (c) => {
    if (!c) return [];
    const price = Number(c.amount || 0);
    const reserve = Number(c.reserve_amount || 0);
    const prima = Number(c.down_payment || 0);
    const term = Number(c.payment_term || 0);
    const financed = Math.max(price - (reserve + prima), 0);
    if (!term || !financed) return [];
    const base = financed / term;
    return Array.from({ length: term }).map((_, i) => ({
      number: i + 1,
      due_date: null,
      amount: base,
      status: "pending",
    }));
  };

  useEffect(() => {
    if (!open || !contract) return;

    let raw = contract.payment_schedule;

    // If backend stores JSON string, attempt to parse
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = null;
      }
    }

    if (Array.isArray(raw) && raw.length) {
      setSchedule(raw);
    } else {
      setSchedule(buildSynthetic(contract));
    }
  }, [open, contract]);

  const summary = useMemo(() => {
    if (!contract) return null;
    const price = Number(contract.amount || 0);
    const reserve = Number(contract.reserve_amount || 0);
    const prima = Number(contract.down_payment || 0);
    const term = Number(contract.payment_term || 0);
    const financed = Math.max(price - (reserve + prima), 0);
    const monthly = term ? financed / term : 0;
    return { price, reserve, prima, financed, term, monthly };
  }, [contract]);

  if (!open) return null;

  const fmt = (v) =>
    v === null || v === undefined
      ? "—"
      : Number(v).toLocaleString(undefined, {
          style: "currency",
          currency: "HNL",
          minimumFractionDigits: 2,
        });

    // I want to create a function that traslate payment_type: reservation, down_payment, installment
    const translatePaymentType = (type) => {
      switch (type?.toLowerCase()) {
        case "reservation": return "Reserva";
        case "down_payment": return "Prima";
        case "installment": return "Cuota";
        default: return "N/A";
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-3xl bg-white dark:bg-darkblack-600 rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-bgray-200 dark:border-darkblack-400">
          <div>
            <h3 className="text-lg font-bold text-bgray-900 dark:text-white">Plan de Pagos</h3>
            <p className="text-xs text-bgray-500 dark:text-bgray-300 mt-1">
              Contrato #{contract?.id} • {contract?.applicant_name || "Cliente"} • Creado el {new Date(contract?.created_at).toLocaleDateString() || "Creado En: N/A"}
            </p>
          </div>
            <button
              onClick={onClose}
              className="text-bgray-500 hover:text-bgray-700 dark:text-bgray-300 dark:hover:text-white"
              aria-label="Cerrar"
            >
              ×
            </button>
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 px-6 py-4 text-xs">
            <div className="p-3 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Precio</p>
              <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.price)}</p>
            </div>
            <div className="p-3 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Reserva</p>
              <p className="font-semibold">{fmt(summary.reserve)}</p>
            </div>
            <div className="p-3 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Prima</p>
              <p className="font-semibold">{fmt(summary.prima)}</p>
            </div>
            <div className="p-3 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Financiado</p>
              <p className="font-semibold text-success-600 dark:text-success-400">{fmt(summary.financed)}</p>
            </div>
            <div className="p-3 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Meses</p>
              <p className="font-semibold">{summary.term || "—"}</p>
            </div>
            <div className="p-3 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Cuota Est.</p>
              <p className="font-semibold">{fmt(summary.monthly)}</p>
            </div>
          </div>
        )}

        <div className="overflow-auto px-6 pb-6">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="text-left text-bgray-500 dark:text-bgray-300 border-b border-bgray-200 dark:border-darkblack-400">
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">Fecha</th>
                <th className="py-2 pr-3 font-medium">Tipo</th>
                <th className="py-2 pr-3 font-medium text-right">Monto</th>
                <th className="py-2 pr-3 font-medium text-right">Mora</th>
                <th className="py-2 pr-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-bgray-500">
                    No hay plan disponible.
                  </td>
                </tr>
              )}
              {schedule.map((row, idx) => {
                const amount = row.amount || row.value || row.payment_amount;
                const interest = row.interest_amount || 0;
                const status = (row.status || "pending").toLowerCase();
                return (
                  <tr
                    key={idx}
                    className="border-b border-bgray-100 dark:border-darkblack-500 last:border-b-0"
                  >
                    <td className="py-2 pr-3">{row.number || idx + 1}</td>
                    <td className="py-2 pr-3">
                      {row.due_date ? new Date(row.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {translatePaymentType(row.payment_type) || "—"}
                    </td>
                    <td className="py-2 pr-3 text-right font-medium">{fmt(amount)}</td>
                    <td className="py-2 pr-3 text-right font-medium">
                      {fmt(interest)}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={
                          "px-2 py-0.5 rounded-full text-[11px] font-semibold " +
                          (status === "paid"
                            ? "bg-green-100 text-green-700"
                            : status === "overdue"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-700")
                        }
                      >
                        {status === "paid" ? "Pagado" : status === "overdue" ? "Vencido" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-bgray-200 dark:border-darkblack-400 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-bgray-200 hover:bg-bgray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-bgray-800 dark:text-bgray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

PaymentScheduleModal.propTypes = {
  contract: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default PaymentScheduleModal;