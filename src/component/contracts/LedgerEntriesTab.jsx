import PropTypes from 'prop-types';

const LedgerEntriesTab = ({ ledgerLoading, ledgerEntries, fmt }) => {
  return (
    <>
      {ledgerLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-bgray-500 dark:text-bgray-300">Cargando asientos contables...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {(!Array.isArray(ledgerEntries) || ledgerEntries.length === 0) ? (
            <div className="text-center py-8 text-bgray-500 dark:text-bgray-300">
              No hay asientos contables registrados para este contrato.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-white dark:bg-darkblack-600 sticky top-0">
                  <tr className="text-left text-bgray-500 dark:text-bgray-300 border-b border-bgray-200 dark:border-darkblack-400">
                    <th className="py-3 pr-3 font-medium">#</th>
                    <th className="py-3 pr-3 font-medium">Fecha</th>
                    <th className="py-3 pr-3 font-medium">Descripción</th>
                    <th className="py-3 pr-3 font-medium">Referencia</th>
                    <th className="py-3 pr-3 font-medium text-right">Debe</th>
                    <th className="py-3 pr-3 font-medium text-right">Haber</th>
                    <th className="py-3 pr-3 font-medium text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const safeLedger = Array.isArray(ledgerEntries) ? ledgerEntries : [];
                    const toNumeric = (val) => {
                      if (val === null || val === undefined || val === "") return 0;
                      if (typeof val === 'number' && !Number.isNaN(val)) return val;
                      // Remove any non-numeric characters (like currency symbols, commas, spaces)
                      const cleaned = String(val).replace(/[^0-9.-]+/g, '');
                      const n = parseFloat(cleaned);
                      return Number.isFinite(n) ? n : 0;
                    };

                    return safeLedger.map((entry, idx) => {
                      // Calculate accumulated balance (sum of amounts up to this entry)
                      const previousEntries = safeLedger.slice(0, idx);
                      const accumulatedBalance = previousEntries.reduce((sum, prevEntry) => {
                        return sum + toNumeric(prevEntry.amount);
                      }, 0) + toNumeric(entry.amount);

                      return (
                        <tr
                          key={entry.id || idx}
                          className="border-b border-bgray-100 dark:border-darkblack-500 last:border-b-0 hover:bg-bgray-50 dark:hover:bg-darkblack-500"
                        >
                          <td className="py-3 pr-3 font-medium text-bgray-900 dark:text-white">{idx + 1}</td>
                          <td className="py-3 pr-3 text-bgray-900 dark:text-white">
                            {entry.entry_date ? (() => {
                              const date = new Date(entry.entry_date);
                              const month = (date.getMonth() + 1).toString().padStart(2, '0');
                              const day = date.getDate().toString().padStart(2, '0');
                              const year = date.getFullYear();
                              return `${month}/${day}/${year}`;
                            })() : "—"}
                          </td>
                          <td className="py-3 pr-3 text-bgray-900 dark:text-white max-w-xs truncate" title={entry.description}>
                            {entry.description || "Sin descripción"}
                          </td>
                          <td className="py-3 pr-3 text-bgray-600 dark:text-bgray-400 text-xs">
                            {entry.payment_id ? `Pago #${entry.payment_id}` : "—"}
                          </td>
                          <td className="py-3 pr-3 text-right font-medium text-red-600 dark:text-red-400">
                            {toNumeric(entry.amount) > 0 ? `${fmt(toNumeric(entry.amount))}` : "—"}
                          </td>
                          <td className="py-3 pr-3 text-right font-medium text-green-600 dark:text-green-400">
                            {toNumeric(entry.amount) < 0 ? `${fmt(Math.abs(toNumeric(entry.amount)))}` : "—"}
                          </td>
                          <td className="py-3 pr-3 text-right font-semibold text-bgray-900 dark:text-white">
                            {fmt(accumulatedBalance)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-bgray-300 dark:border-darkblack-300 bg-bgray-50 dark:bg-darkblack-500">
                    <td colSpan="4" className="py-3 pr-3 font-bold text-right text-bgray-900 dark:text-white">TOTALES:</td>
                    <td className="py-3 pr-3 text-right font-bold text-red-600 dark:text-red-400">
                      {Number((Array.isArray(ledgerEntries) ? ledgerEntries : [])
                        .filter(entry => Number(entry.amount) > 0)
                        .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
                      ).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " HNL"}
                    </td>
                    <td className="py-3 pr-3 text-right font-bold text-green-600 dark:text-green-400">
                      {Number(Math.abs((Array.isArray(ledgerEntries) ? ledgerEntries : [])
                        .filter(entry => Number(entry.amount) < 0)
                        .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
                      )).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " HNL"}
                    </td>
                    <td className="py-3 pr-3 text-right font-bold text-bgray-900 dark:text-white">
                      {Number((Array.isArray(ledgerEntries) ? ledgerEntries : [])
                        .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
                      ).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " HNL"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

LedgerEntriesTab.propTypes = {
  ledgerLoading: PropTypes.bool,
  ledgerEntries: PropTypes.array,
  fmt: PropTypes.func.isRequired
};

export default LedgerEntriesTab;