// src/component/contracts/ContractDetailsModal.jsx
import { createPortal } from "react-dom";
import { useState, useContext, useEffect } from "react";
import { formatStatus } from "../../utils/formatStatus";
import { useLocale } from "../../contexts/LocaleContext";
import { useToast } from "../../contexts/ToastContext";
import { API_URL } from "../../../config";
import AuthContext from "../../context/AuthContext";

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

// Contract Details Modal Component
const ContractDetailsModal = ({
  isOpen,
  onClose,
  contract,
  onContractUpdate,
}) => {
  const { t } = useLocale();
  const { user, token } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  // Editable fields
  const [paymentTerm, setPaymentTerm] = useState(contract?.payment_term ?? "");
  const [reserveAmount, setReserveAmount] = useState(
    contract?.reserve_amount ?? ""
  );
  const [downPayment, setDownPayment] = useState(contract?.down_payment ?? "");

  // Update local state when contract changes (after save)
  useEffect(() => {
    if (contract) {
      setPaymentTerm(contract.payment_term ?? "");
      setReserveAmount(contract.reserve_amount ?? "");
      setDownPayment(contract.down_payment ?? "");
    }
  }, [
    contract?.id,
    contract?.payment_term,
    contract?.reserve_amount,
    contract?.down_payment,
  ]);

  if (!isOpen || !contract) return null;

  // Calculate monthly payment with current values
  const calculateCurrentMonthlyPayment = () => {
    const amount = Number(contract.amount);
    const term = Number(paymentTerm || 0);
    const down = Number(downPayment || 0);
    const reserve = Number(reserveAmount || 0);

    if (!amount || !term || term <= 0) return "N/A";

    const principal =
      contract.financing_type?.toLowerCase() === "cash"
        ? amount
        : amount - down - reserve;

    if (principal <= 0) return "N/A";

    const monthlyPayment = principal / term;
    return formatCurrency(monthlyPayment);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            payment_term: Number(paymentTerm),
            reserve_amount: Number(reserveAmount),
            down_payment: Number(downPayment),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.errors?.join(", ") ||
            t("contractDetailsModal.errorSaving")
        );
      }

      const result = await response.json();
      showToast(
        result.message || t("contractDetailsModal.savedSuccessfully"),
        "success"
      );
      setIsEditMode(false);

      // Notify parent component of update
      if (onContractUpdate) {
        onContractUpdate(result.contract);
      }
    } catch (error) {
      console.error("Error saving contract:", error);
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setPaymentTerm(contract.payment_term ?? "");
    setReserveAmount(contract.reserve_amount ?? "");
    setDownPayment(contract.down_payment ?? "");
    setIsEditMode(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl bg-white dark:bg-darkblack-600 rounded-2xl shadow-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-bgray-200 dark:border-darkblack-400 bg-indigo-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📋</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {t("contractDetailsModal.title")}
              </h3>
              <p className="text-sm text-indigo-100">
                {t("contractDetailsModal.subtitle", {
                  contractId: contract.contract_id || "N/A",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/90 hover:bg-white/30 text-white border border-white/30 hover:border-white/40 transition-all duration-200 flex items-center space-x-2"
              >
                <span>✏️</span>
                <span>{t("contractDetailsModal.edit")}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white hover:text-indigo-200 transition-all duration-200 text-xl font-light"
              aria-label={t("contractDetailsModal.close")}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Main Information Grid - 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Project Information */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏢</span>
                </div>
                <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  {t("contractDetailsModal.project")}
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    📍
                  </span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {t("contractDetailsModal.name")}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {contract.project_name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    🏠
                  </span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {t("contractDetailsModal.address")}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {contract.project_address || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    🆔
                  </span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {t("contractDetailsModal.id")}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                      {contract.project_id || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lot Information */}
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏡</span>
                </div>
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  {t("contractDetailsModal.lot")}
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">
                    🏠
                  </span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {t("contractDetailsModal.name")}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {contract.lot_name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">
                    📍
                  </span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {t("contractDetailsModal.address")}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {contract.lot_address || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">
                    🆔
                  </span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {t("contractDetailsModal.id")}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                      {contract.lot_id || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Information */}
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
                <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                  {t("contractDetailsModal.applicant")}
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">
                    👤
                  </span>
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      {t("contractDetailsModal.name")}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {contract.applicant_name || "N/A"}
                    </p>
                  </div>
                </div>
                {contract.applicant_identity && (
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">
                      🆔
                    </span>
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        {t("contractDetailsModal.identity")}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-mono">
                        {contract.applicant_identity}
                      </p>
                    </div>
                  </div>
                )}
                {contract.applicant_phone && (
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">
                      📞
                    </span>
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        {t("contractDetailsModal.phone")}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {contract.applicant_phone}
                      </p>
                    </div>
                  </div>
                )}
                {(contract.applicant_credit_score ||
                  contract.applicant_credit_score >= 0) && (
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5">
                      📊
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                        {t("contractDetailsModal.creditScore")}
                      </p>
                      <div className="flex items-center space-x-3">
                        {/* Circular Progress */}
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <svg
                            className="w-12 h-12 transform -rotate-90"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-purple-200 dark:text-purple-900"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${
                                (contract.applicant_credit_score / 100) * 251.2
                              } 251.2`}
                              className={`transition-all duration-500 ${
                                contract.applicant_credit_score >= 80
                                  ? "text-green-500 dark:text-green-400"
                                  : contract.applicant_credit_score >= 60
                                  ? "text-yellow-500 dark:text-yellow-400"
                                  : "text-red-500 dark:text-red-400"
                              }`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-800 dark:text-purple-200">
                              {Math.round(contract.applicant_credit_score)}%
                            </span>
                          </div>
                        </div>
                        {/* Score Label */}
                        <div className="flex-1">
                          <div
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              contract.applicant_credit_score >= 80
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : contract.applicant_credit_score >= 60
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {contract.applicant_credit_score >= 80
                              ? t("creditScore.excellent")
                              : contract.applicant_credit_score >= 60
                              ? t("creditScore.good")
                              : t("creditScore.needsImprovement")}
                          </div>
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            {t("creditScore.description")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information - Full Width */}
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
                <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                  {t("contractDetailsModal.financialInfo")}
                </h4>
              </div>
              {isEditMode && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200 disabled:opacity-50"
                  >
                    {t("contractDetailsModal.cancel")}
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>{t("contractDetailsModal.saving")}</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>{t("contractDetailsModal.save")}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                  💵
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                    {t("contractDetailsModal.totalPrice")}
                  </p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {contract.amount ? formatCurrency(contract.amount) : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                  💳
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                    {t("contractDetailsModal.financingType")}
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {t(
                      `contractDetailsModal.financingTypes.${contract.financing_type?.toLowerCase()}`
                    ) || "N/A"}
                  </p>
                </div>
              </div>
              {contract.financing_type?.toLowerCase() === "direct" && (
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                    📅
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                      {t("contractDetailsModal.paymentTerm")}
                    </p>
                    {isEditMode ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={paymentTerm}
                          onChange={(e) => setPaymentTerm(e.target.value)}
                          className="w-24 px-3 py-1.5 text-sm border border-emerald-300 dark:border-emerald-600 rounded-lg bg-white dark:bg-darkblack-600 text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          min="1"
                        />
                        <span className="text-sm text-emerald-700 dark:text-emerald-300">
                          {t("contractDetailsModal.months")}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {paymentTerm !== ""
                          ? `${paymentTerm} ${t("contractDetailsModal.months")}`
                          : "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                  💰
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                    {t("contractDetailsModal.reserveAmount")}
                  </p>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={reserveAmount}
                      onChange={(e) => setReserveAmount(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-emerald-300 dark:border-emerald-600 rounded-lg bg-white dark:bg-darkblack-600 text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {reserveAmount !== ""
                        ? formatCurrency(Number(reserveAmount))
                        : "N/A"}
                    </p>
                  )}
                </div>
              </div>
              {contract.financing_type?.toLowerCase() === "direct" && (
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                    💵
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                      {t("contractDetailsModal.downPayment")}
                    </p>
                    {isEditMode ? (
                      <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-emerald-300 dark:border-emerald-600 rounded-lg bg-white dark:bg-darkblack-600 text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {downPayment !== ""
                          ? formatCurrency(Number(downPayment))
                          : "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                  💳
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                    {t("contractDetailsModal.financedAmount")}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      isEditMode
                        ? "text-emerald-900 dark:text-emerald-100 bg-emerald-200 dark:bg-emerald-800/50 px-2 py-1 rounded"
                        : "text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {contract.amount
                      ? formatCurrency(
                          Number(contract.amount) -
                            Number(reserveAmount || 0) -
                            (contract.financing_type?.toLowerCase() === "direct"
                              ? Number(downPayment || 0)
                              : 0)
                        )
                      : "N/A"}
                  </p>
                  {isEditMode && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      {t("contractDetailsModal.autoCalculated")}
                    </p>
                  )}
                </div>
              </div>
              {contract.financing_type?.toLowerCase() === "direct" && (
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                    📅
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                      {t("contractDetailsModal.monthlyPayment")}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        isEditMode
                          ? "text-emerald-900 dark:text-emerald-100 bg-emerald-200 dark:bg-emerald-800/50 px-2 py-1 rounded"
                          : "text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {calculateCurrentMonthlyPayment()}
                    </p>
                    {isEditMode && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        {t("contractDetailsModal.autoCalculated")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contract Status and Additional Info - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contract Status */}
            <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {t("contractDetailsModal.contractStatus")}
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-gray-600 dark:text-gray-400 mt-0.5">
                    📋
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {t("contractDetailsModal.status")}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {formatStatus(contract.status, t) ||
                        t("common.notAvailable")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-600 dark:text-gray-400 mt-0.5">
                    🆔
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {t("contractDetailsModal.contractId")}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {contract.contract_id || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-gray-600 dark:text-gray-400 mt-0.5">
                    📅
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {t("contractDetailsModal.creationDate")}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {contract.created_at
                        ? new Date(contract.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                {contract.approved_at && (
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-600 dark:text-gray-400 mt-0.5">
                      ✅
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {t("contractDetailsModal.approvalDate")}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(contract.approved_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Contract Information */}
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                  {t("contractDetailsModal.additionalInfo")}
                </h4>
              </div>
              <div className="space-y-3">
                {contract.rejection_reason && (
                  <div className="flex items-start space-x-2">
                    <span className="text-orange dark:text-orange mt-0.5">
                      ❌
                    </span>
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        {t("contractDetailsModal.rejectionReason")}
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {contract.rejection_reason}
                      </p>
                    </div>
                  </div>
                )}
                {!contract.rejection_reason && (
                  <div className="text-center py-4">
                    <p className="text-sm text-orange dark:text-orange">
                      {t("contractDetailsModal.noAdditionalInfo")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contract Notes - Full Width */}
          {contract.note && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  {t("contractDetailsModal.contractNotes")}
                </h4>
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
        <div className="flex justify-end px-8 py-4 border-t border-bgray-200 dark:border-darkblack-400 bg-gray-50 dark:bg-darkblack-500">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {t("contractDetailsModal.close")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ContractDetailsModal;
