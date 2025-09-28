import PropTypes from 'prop-types';

const PaymentScheduleTab = ({
  loading,
  schedule,
  totals,
  isReadOnly,
  fmt,
  translatePaymentType,
  calculateMoratoryDays,
  setSelectedPayment,
  setEditableAmount,
  setEditableInterest,
  setEditableTotal,
  setApplyPaymentModal,
  setEditingMora,
  setMoratoryAmount,
  setSchedule,
  setCurrentContract,
  onPaymentSuccess,
  currentContract
}) => {
  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-bgray-500 dark:text-bgray-300">Cargando plan de pagos...</div>
        </div>
      ) : (
        <table className="w-full text-xs md:text-sm">
          <thead className="sticky top-0 bg-white dark:bg-darkblack-600">
            <tr className="text-left text-bgray-500 dark:text-bgray-300 border-b border-bgray-200 dark:border-darkblack-400">
              <th className="py-3 pr-3 font-medium">#</th>
              <th className="py-3 pr-3 font-medium">Fecha</th>
              <th className="py-3 pr-3 font-medium">Tipo</th>
              <th className="py-3 pr-3 font-medium text-right">Monto</th>
              <th className="py-3 pr-3 font-medium text-right">Interés</th>
              <th className="py-3 pr-3 font-medium text-center">Días Mora</th>
              <th className="py-3 pr-3 font-medium">Estado</th>
              <th className="py-3 pr-3 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(!Array.isArray(schedule) || schedule.length === 0) && (
              <tr>
                <td colSpan="8" className="py-6 text-center text-bgray-500 dark:text-bgray-300">
                  No hay plan disponible.
                </td>
              </tr>
            )}
            {(Array.isArray(schedule) ? schedule : []).map((row, idx) => {
              const amount = row.amount || row.value || row.payment_amount;
              const interest = row.interest_amount || 0;
              const status = (row.status || "pending").toLowerCase();
              // Normalize moratory days to a number in case the source is a string
              const moratoryDaysRaw = (row.overdue_days ?? row.moratory_days ?? calculateMoratoryDays(row.due_date));
              const moratoryDaysParsed = parseInt(moratoryDaysRaw, 10);
              const moratoryDays = Number.isNaN(moratoryDaysParsed) ? 0 : moratoryDaysParsed;

              // Derive payment state: some APIs don't include an 'overdue' status
              const isPaid = (row.status || "").toString().toLowerCase() === "paid";
              const isOverdue = !isPaid && moratoryDays > 0;

              const getMoratoryDaysColor = (days) => {
                const d = Number(days) || 0;
                if (d >= 90) return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
                if (d >= 60) return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300";
                if (d >= 30) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
                return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
              };

              return (
                <tr
                  key={row.id || idx}
                  className="border-b border-bgray-100 dark:border-darkblack-500 last:border-b-0 hover:bg-bgray-50 dark:hover:bg-darkblack-500"
                >
                  <td className="py-3 pr-3 font-medium text-bgray-900 dark:text-white">{row.number || idx + 1}</td>
                  <td className="py-3 pr-3 text-bgray-900 dark:text-white">
                    {row.due_date ? new Date(row.due_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-1 bg-bgray-100 dark:bg-darkblack-400 text-bgray-900 dark:text-white rounded text-xs">
                      {translatePaymentType(row.payment_type)}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right font-medium text-bgray-900 dark:text-white">{fmt(amount)}</td>
                  <td className="py-3 pr-3 text-right font-medium text-bgray-900 dark:text-white">{fmt(interest)}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoratoryDaysColor(moratoryDays)}`}>
                      {moratoryDays} días
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={
                        "px-2 py-0.5 rounded-full text-[11px] font-semibold " +
                        (isPaid
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : isOverdue
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300")
                      }
                    >
                      {isPaid ? "Pagado" : isOverdue ? "Vencido" : "Pendiente"}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {!isReadOnly && !isPaid && (
                        <button
                          onClick={() => {
                            setSelectedPayment(row);
                            setEditableAmount(amount?.toString() || "");
                            setEditableInterest(interest?.toString() || "");
                            setEditableTotal(((Number(amount) || 0) + (Number(interest) || 0)).toString());
                            setApplyPaymentModal(true);
                          }}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                          title="Aplicar Pago"
                        >
                          💰
                        </button>
                      )}
                      {!isReadOnly && !isPaid && moratoryDays > 0 && (
                        <button
                          onClick={() => {
                            setEditingMora(row.id || idx);
                            setMoratoryAmount(interest?.toString() || "0");
                          }}
                          className="px-2 py-1 text-xs font-medium bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition-colors"
                          title="Editar Mora"
                        >
                          ⚠️
                        </button>
                      )}
                      {isPaid && (
                        <>
                          <span className="px-2 py-1 text-xs text-green-600" title="Pagado">
                            ✅
                          </span>
                          {!isReadOnly && (
                            <button
                              onClick={() => {
                                // Handle undo payment logic
                                const safeSchedule = Array.isArray(schedule) ? schedule : [];
                                const updatedSchedule = safeSchedule.map((payment, paymentIdx) =>
                                  (payment.id === row.id || paymentIdx === idx)
                                    ? {
                                        ...payment,
                                        status: "pending",
                                        paid_date: null,
                                        undo_date: new Date().toISOString().split('T')[0]
                                      }
                                    : payment
                                );
                                setSchedule(updatedSchedule);

                                // Update balance by adding back the payment amount
                                const paymentAmount = row.amount || 0;
                                setCurrentContract(prev => ({
                                  ...(prev || {}),
                                  balance: (prev?.balance || 0) + paymentAmount
                                }));

                                // Simulate undo payment response
                                const mockUndoResponse = {
                                  payment: {
                                    ...row,
                                    status: "pending",
                                    paid_date: null,
                                    undo_date: new Date().toISOString().split('T')[0],
                                    contract: {
                                      id: currentContract?.id,
                                      balance: (currentContract?.balance || 0) + paymentAmount,
                                      status: currentContract?.status,
                                      created_at: currentContract?.created_at,
                                      currency: currentContract?.currency || "HNL"
                                    }
                                  }
                                };

                                // Call the callback if provided
                                if (onPaymentSuccess) {
                                  onPaymentSuccess(mockUndoResponse);
                                }

                              }}
                              className="px-2 py-1 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                              title="Deshacer Pago"
                            >
                              ↩️
                            </button>
                          )}
                        </>
                      )}
                      {isReadOnly && !isPaid && (
                        <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400" title="Solo lectura">
                          👁️
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Totals Row */}
            <tr className="border-t-2 border-bgray-300 dark:border-darkblack-300 bg-bgray-50 dark:bg-darkblack-500">
              <td colSpan="3" className="py-3 pr-3 font-bold text-right text-bgray-900 dark:text-white">Subtotal:</td>
              <td className="py-3 pr-3 text-right font-bold text-bgray-900 dark:text-white">{fmt(totals.subtotal)}</td>
              <td className="py-3 pr-3 text-right font-bold text-success-600 dark:text-success-400">{fmt(totals.totalInterest)}</td>
              <td colSpan="3"></td>
            </tr>
            <tr className="bg-bgray-100 dark:bg-darkblack-400">
              <td colSpan="3" className="py-3 pr-3 font-bold text-right text-lg text-bgray-900 dark:text-white">TOTAL:</td>
              <td colSpan="2" className="py-3 pr-3 text-right font-bold text-lg text-bgray-900 dark:text-white">
                {fmt(totals.total)}
              </td>
              <td colSpan="3"></td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
};

PaymentScheduleTab.propTypes = {
  loading: PropTypes.bool,
  schedule: PropTypes.array,
  totals: PropTypes.object,
  isReadOnly: PropTypes.bool,
  fmt: PropTypes.func.isRequired,
  translatePaymentType: PropTypes.func.isRequired,
  calculateMoratoryDays: PropTypes.func.isRequired,
  setSelectedPayment: PropTypes.func.isRequired,
  setEditableAmount: PropTypes.func.isRequired,
  setEditableInterest: PropTypes.func.isRequired,
  setEditableTotal: PropTypes.func.isRequired,
  setApplyPaymentModal: PropTypes.func.isRequired,
  setEditingMora: PropTypes.func.isRequired,
  setMoratoryAmount: PropTypes.func.isRequired,
  setSchedule: PropTypes.func.isRequired,
  setCurrentContract: PropTypes.func.isRequired,
  onPaymentSuccess: PropTypes.func,
  currentContract: PropTypes.object
};

export default PaymentScheduleTab;