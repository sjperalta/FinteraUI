// src/component/contracts/ContractDetailsModal.jsx
import { createPortal } from "react-dom";
import { formatStatus } from "../../utils/formatStatus";
import { useLocale } from "../../contexts/LocaleContext";

const formatCurrency = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return v;
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " HNL";
};

// Calculate monthly payment
const calculateMonthlyPayment = (contract) => {
  if (!contract) return "N/A";
  
  const { amount, down_payment, payment_term, financing_type } = contract;
  
  if (!amount || !payment_term) return "N/A";
  
  const principal = financing_type?.toLowerCase() === "cash" 
    ? Number(amount) 
    : Number(amount) - Number(down_payment || 0);
    
  if (principal <= 0 || Number(payment_term) <= 0) return "N/A";
  
  const monthlyPayment = principal / Number(payment_term);
  return formatCurrency(monthlyPayment);
};

// Contract Details Modal Component
const ContractDetailsModal = ({ isOpen, onClose, contract }) => {
  const { t } = useLocale();
  if (!isOpen || !contract) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white dark:bg-darkblack-600 rounded-2xl shadow-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-bgray-200 dark:border-darkblack-400 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📋</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t('contractDetailsModal.title')}</h3>
              <p className="text-sm text-indigo-100">
                {t('contractDetailsModal.subtitle', { contractId: contract.contract_id || 'N/A' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white hover:text-indigo-200 transition-all duration-200 text-xl font-light"
            aria-label={t('contractDetailsModal.close')}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Main Information Grid - 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Project Information */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏢</span>
                </div>
                <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">{t('contractDetailsModal.project')}</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">📍</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('contractDetailsModal.name')}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{contract.project_name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">🏠</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('contractDetailsModal.address')}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{contract.project_address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">🆔</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('contractDetailsModal.id')}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">{contract.project_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lot Information */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏡</span>
                </div>
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">{t('contractDetailsModal.lot')}</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">🏠</span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{t('contractDetailsModal.name')}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{contract.lot_name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">📍</span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{t('contractDetailsModal.address')}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{contract.lot_address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">🆔</span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{t('contractDetailsModal.id')}</p>
                    <p className="text-sm text-green-700 dark:text-green-300 font-mono">{contract.lot_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Information */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
                <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200">{t('contractDetailsModal.applicant')}</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">👤</span>
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">{t('contractDetailsModal.name')}</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{contract.applicant_name || 'N/A'}</p>
                  </div>
                </div>
                {contract.applicant_identity && (
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">🆔</span>
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">{t('contractDetailsModal.identity')}</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-mono">{contract.applicant_identity}</p>
                    </div>
                  </div>
                )}
                {contract.applicant_phone && (
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">📞</span>
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">{t('contractDetailsModal.phone')}</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">{contract.applicant_phone}</p>
                    </div>
                  </div>
                )}
                {(contract.applicant_credit_score || contract.applicant_credit_score >= 0) && (
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">📊</span>
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">{t('contractDetailsModal.creditScore')}</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">{contract.applicant_credit_score}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information - Full Width */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 shadow-sm mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
              <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">{t('contractDetailsModal.financialInfo')}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">💵</span>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t('contractDetailsModal.totalPrice')}</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {contract.amount ? formatCurrency(contract.amount) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">💳</span>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t('contractDetailsModal.financingType')}</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{t(`contractDetailsModal.financingTypes.${contract.financing_type?.toLowerCase()}`) || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">📅</span>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t('contractDetailsModal.paymentTerm')}</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{contract.payment_term || 'N/A'} {t('contractDetailsModal.months')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">💰</span>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t('contractDetailsModal.reserveAmount')}</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {contract.reserve_amount ? formatCurrency(contract.reserve_amount) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">💵</span>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t('contractDetailsModal.downPayment')}</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {contract.down_payment ? formatCurrency(contract.down_payment) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">📅</span>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t('contractDetailsModal.monthlyPayment')}</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                    {calculateMonthlyPayment(contract)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Status and Additional Info - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contract Status */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('contractDetailsModal.contractStatus')}</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-gray-600 dark:text-gray-400 mt-0.5">📋</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('contractDetailsModal.status')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">{formatStatus(contract.status, t) || t('common.notAvailable')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-600 dark:text-gray-400 mt-0.5">🆔</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('contractDetailsModal.contractId')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{contract.contract_id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-600 dark:text-gray-400 mt-0.5">📅</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('contractDetailsModal.creationDate')}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{contract.created_at ? new Date(contract.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                {contract.approved_at && (
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-600 dark:text-gray-400 mt-0.5">✅</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('contractDetailsModal.approvalDate')}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(contract.approved_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Contract Information */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-200 dark:border-orange-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">{t('contractDetailsModal.additionalInfo')}</h4>
              </div>
              <div className="space-y-3">
                {contract.rejection_reason && (
                  <div className="flex items-start space-x-2">
                    <span className="text-orange dark:text-orange mt-0.5">❌</span>
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">{t('contractDetailsModal.rejectionReason')}</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">{contract.rejection_reason}</p>
                    </div>
                  </div>
                )}
                {!contract.rejection_reason && (
                  <div className="text-center py-4">
                    <p className="text-sm text-orange dark:text-orange">{t('contractDetailsModal.noAdditionalInfo')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contract Notes - Full Width */}
          {contract.note && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">{t('contractDetailsModal.contractNotes')}</h4>
              </div>
              <div className="bg-white/50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-600">
                <div 
                  className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: contract.note }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-8 py-0 border-t border-bgray-200 dark:border-darkblack-400 bg-gray-50 dark:bg-darkblack-500">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {t('contractDetailsModal.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ContractDetailsModal;