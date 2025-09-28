import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import ProjectLotCards from "./ProjectLotCards";
import CreditScoreCard from "./CreditScoreCard";
import ContractInfoCard from "./ContractInfoCard";
import PaymentScheduleTab from "./PaymentScheduleTab";
import LedgerEntriesTab from "./LedgerEntriesTab";
import ContractSummaryCards from "./ContractSummaryCards";
import ContractNotesTab from "./ContractNotesTab";

function PaymentScheduleModal({ contract, open, onClose, onPaymentSuccess }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMora, setEditingMora] = useState(null);
  const [moratoryAmount, setMoratoryAmount] = useState("");
  const [applyPaymentModal, setApplyPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editableAmount, setEditableAmount] = useState("");
  const [editableInterest, setEditableInterest] = useState("");
  const [editableTotal, setEditableTotal] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState(() => contract || null);
  const [activeTab, setActiveTab] = useState('payments');
  const [ledgerEntries, setLedgerEntries] = useState([]); // Ensure ledgerEntries is always initialized as an array
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const token = getToken();

  console.log(contract);

  // Build synthetic schedule (fallback when no payment_schedule present)
  const buildSynthetic = (c) => {
    if (!c || typeof c !== 'object') return [];
    
    try {
      const price = Number(c.amount || 0);
      const reserve = Number(c.reserve_amount || 0);
      const prima = Number(c.down_payment || 0);
      const term = Number(c.payment_term || 0);
      const financed = Math.max(price - (reserve + prima), 0);
      
      const schedule = [];
      let idCounter = 1;
    
    // Calculate base due dates from contract creation date or current date
    const startDate = new Date(c.created_at || new Date());
    let currentDueDate = new Date(startDate);

    // Add reservation payment if exists - due immediately
    if (reserve > 0) {
      schedule.push({
        id: idCounter++,
        number: 1,
        due_date: startDate.toISOString().split('T')[0],
        amount: reserve,
        interest_amount: 0,
        moratory_days: 0,
        status: "pending",
        payment_type: "reservation"
      });
    }

    // Add down payment if exists - due 30 days after contract
    if (prima > 0) {
      const downPaymentDate = new Date(startDate);
      downPaymentDate.setDate(downPaymentDate.getDate() + 30);
      schedule.push({
        id: idCounter++,
        number: schedule.length + 1,
        due_date: downPaymentDate.toISOString().split('T')[0],
        amount: prima,
        interest_amount: 0,
        moratory_days: 0,
        status: "pending",
        payment_type: "down_payment"
      });
      currentDueDate = new Date(downPaymentDate);
    }

    // Add installments - monthly after down payment
    if (term > 0 && financed > 0) {
      const base = financed / term;
      for (let i = 0; i < term; i++) {
        currentDueDate.setMonth(currentDueDate.getMonth() + 1);
        schedule.push({
          id: idCounter++,
          number: schedule.length + 1,
          due_date: new Date(currentDueDate).toISOString().split('T')[0],
          amount: base,
          interest_amount: 0,
          moratory_days: 0,
          status: "pending",
          payment_type: "installment"
        });
      }
    }

    return schedule;
    } catch (error) {
      console.error('Error building synthetic schedule:', error);
      return [];
    }
  };

  // Load payment schedule from contract or build synthetic
  const loadPaymentSchedule = () => {
    if (!contract) {
      setSchedule([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Use payment_schedule from contract if available
      if (contract.payment_schedule && Array.isArray(contract.payment_schedule) && contract.payment_schedule.length > 0) {
        setSchedule(contract.payment_schedule);
      } else {
        // Fallback to synthetic schedule
        const synthetic = buildSynthetic(contract);
        setSchedule(Array.isArray(synthetic) ? synthetic : []);
      }
    } catch (error) {
      console.error('Error loading payment schedule:', error);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  // Load ledger entries from API
  const loadLedgerEntries = async (contractData = currentContract) => {
    if (!contractData?.project_id || !contractData?.lot_id || !contractData?.id) {
      return;
    }

    if (!token) {
      setLedgerLoading(false);
      return;
    }

    if (ledgerLoading) {
      return;
    }

    setLedgerLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contractData.project_id}/lots/${contractData.lot_id}/contracts/${contractData.id}/ledger`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error loading ledger: ${response.status}`);
      }

      const data = await response.json();
      setLedgerEntries(data || []);
    } catch (error) {
      console.error('Error loading ledger entries:', error);
      setLedgerEntries([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  // Handle payment response and update contract balance
  const handlePaymentResponse = (paymentResponse) => {
   
    // Update the contract balance if included in the response
    if (paymentResponse?.payment?.contract?.balance !== undefined) {
      setCurrentContract(prev => ({
        ...(prev || {}),
        balance: paymentResponse.payment.contract.balance
      }));
    }
    
    // Call the original callback if provided
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentResponse);
    }
  };

  useEffect(() => {
    if (!open || !contract) {
      return;
    }
    setCurrentContract(prev => contract || null);
    loadPaymentSchedule();
  }, [open, contract]);

  // Clear ledger entries when modal is closed
  useEffect(() => {
    if (!open) {
      setLedgerEntries([]);
      setLedgerLoading(false);
      setActiveTab('payments');
    }
  }, [open]);

  // Load ledger entries when modal opens
  useEffect(() => {
    if (open && currentContract) {
      loadLedgerEntries(currentContract);
    }
  }, [open, currentContract]);

  // Calculate totals
  const totals = useMemo(() => {
    const safeSchedule = Array.isArray(schedule) ? schedule : [];
    const subtotal = safeSchedule.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalInterest = safeSchedule.reduce((sum, payment) => sum + Number(payment.interest_amount || 0), 0);
    const total = subtotal + totalInterest;
    
    return { subtotal, totalInterest, total };
  }, [schedule]);

  const summary = useMemo(() => {
    if (!currentContract) return null;
    const price = Number(currentContract.amount || 0);
    const reserve = Number(currentContract.reserve_amount || 0);
    const prima = Number(currentContract.down_payment || 0);
    const term = Number(currentContract.payment_term || 0);
    const financed = Math.max(price - (reserve + prima), 0);
    const monthly = term ? financed / term : 0;
    return { price, reserve, prima, financed, term, monthly };
  }, [currentContract]);

  // Check if contract is closed (read-only mode)
  const isReadOnly = currentContract?.status?.toLowerCase() === 'closed';

  if (!open) return null;

  if (!contract) {
    return null;
  }

  const fmt = (v) =>
    v === null || v === undefined || v === ""
      ? "—"
      : Number(v).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " HNL";


  const translatePaymentType = (type) => {
    const normalizedType = type?.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedType) {
      case "reservation": return "Reserva";
      case "down_payment": return "Prima";
      case "installment": return "Cuota";
      default: return type || "Cuota";
    }
  };

  const calculateMoratoryDays = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-6xl bg-white dark:bg-darkblack-600 rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        
        {/* Modern Header */}
        <div className="relative border-b border-bgray-200 dark:border-darkblack-400">
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            title="Cerrar"
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transform transition-all duration-200 shadow-2xl
              bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500
              hover:scale-105 hover:rotate-6
              focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-700
              ring-offset-2 ring-offset-white dark:ring-offset-darkblack-600"
          >
            <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-darkblack-600 dark:via-darkblack-500 dark:to-darkblack-400 opacity-60"></div>
          
          <div className="relative p-4">
            {/* Title */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'payments' ? 'Plan de Pagos' : activeTab === 'ledger' ? 'Asientos Contables' : 'Notas del Contrato'}
                {isReadOnly && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    (Solo lectura)
                  </span>
                )}
              </h3>
              {isReadOnly && (
                <div className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">CERRADO</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
              {/* Contract Information (spans first two columns on xl) */}
              <div className="xl:col-span-2">
                <ContractInfoCard currentContract={currentContract} />
                
                {/* Project & Lot Cards */}
                <ProjectLotCards currentContract={currentContract} />
              </div>
              
              {/* Credit Score Card */}
              <CreditScoreCard creditScore={currentContract?.applicant_credit_score} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-bgray-200 dark:border-darkblack-400">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'payments'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-darkblack-500 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-darkblack-400'
              }`}
            >
              📋 Plan de Pagos
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'ledger'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-darkblack-500 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-darkblack-400'
              }`}
            >
              📊 Asientos Contables
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'notes'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-darkblack-500 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-darkblack-400'
              }`}
            >
              📝 Notas del Contrato
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <ContractSummaryCards summary={summary} currentContract={currentContract} fmt={fmt} />

        {/* Tab Content */}
        <div className="overflow-auto px-6 pb-6 flex-1">
          {activeTab === 'payments' ? (
            <PaymentScheduleTab
              loading={loading}
              schedule={schedule}
              totals={totals}
              isReadOnly={isReadOnly}
              fmt={fmt}
              translatePaymentType={translatePaymentType}
              calculateMoratoryDays={calculateMoratoryDays}
              setSelectedPayment={setSelectedPayment}
              setEditableAmount={setEditableAmount}
              setEditableInterest={setEditableInterest}
              setEditableTotal={setEditableTotal}
              setApplyPaymentModal={setApplyPaymentModal}
              setEditingMora={setEditingMora}
              setMoratoryAmount={setMoratoryAmount}
              setSchedule={setSchedule}
              setCurrentContract={setCurrentContract}
              onPaymentSuccess={onPaymentSuccess}
              currentContract={currentContract}
            />
          ) : activeTab === 'ledger' ? (
            <LedgerEntriesTab
              ledgerLoading={ledgerLoading}
              ledgerEntries={ledgerEntries}
              fmt={fmt}
            />
          ) : (
            <ContractNotesTab
              currentContract={currentContract}
              onContractUpdate={setCurrentContract}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-bgray-200 dark:border-darkblack-400 flex justify-between items-center">
          {activeTab === 'payments' && !isReadOnly ? (
            <button
              onClick={() => {
                setSelectedPayment({isCapitalPayment: true, number: "Capital"});
                setEditableAmount("");
                setEditableInterest("0");
                setEditableTotal("");
                setApplyPaymentModal(true);
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all duration-200 flex items-center gap-2"
            >
              <span>🏦</span>
              Abono a Capital
            </button>
          ) : (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'ledger' ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {(Array.isArray(ledgerEntries) ? ledgerEntries : []).length} asientos registrados | Asientos contables Solo lectura
                </>
              ) : activeTab === 'notes' ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notas del contrato | Información adicional del contrato
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Contrato cerrado - Solo lectura
                </>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-bgray-200 hover:bg-bgray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-bgray-800 dark:text-bgray-100"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Apply Payment Modal */}
      {applyPaymentModal && selectedPayment && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white dark:bg-darkblack-600 rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {selectedPayment?.isCapitalPayment ? "Abono a Capital" : "Aplicar Pago"}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {selectedPayment?.isCapitalPayment 
                ? "Pago adicional que se aplicará directamente al capital del contrato"
                : `Pago #${selectedPayment.id} - ${translatePaymentType(selectedPayment.payment_type)}`
              }
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {selectedPayment?.isCapitalPayment ? "Monto del Abono" : "Monto a Pagar"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editableAmount}
                  onChange={(e) => {
                    const newAmount = e.target.value;
                    setEditableAmount(newAmount);
                    if (!selectedPayment?.isCapitalPayment) {
                      const amount = parseFloat(newAmount) || 0;
                      const interest = parseFloat(editableInterest) || 0;
                      setEditableTotal((amount + interest).toString());
                    }
                  }}
                  placeholder={selectedPayment?.isCapitalPayment ? "Ingrese el monto del abono" : ""}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white focus:ring-2 focus:ring-blue-300"
                />
              </div>
              {!selectedPayment?.isCapitalPayment && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interés/Mora
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editableInterest}
                      onChange={(e) => {
                        const newInterest = e.target.value;
                        setEditableInterest(newInterest);
                        const amount = parseFloat(editableAmount) || 0;
                        const interest = parseFloat(newInterest) || 0;
                        setEditableTotal((amount + interest).toString());
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total a Pagar (Monto + Interés)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editableTotal}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />                  
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                       Modificar el monto o interés afecta directamente el balance del contrato.
                    </p>
                  </div>
                </>
              )}
              {selectedPayment?.isCapitalPayment && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Este monto se aplicará directamente al capital, reduciendo el balance del contrato.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setApplyPaymentModal(false);
                  setSelectedPayment(null);
                  setEditableAmount("");
                  setEditableInterest("");
                  setEditableTotal("");
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-gray-800 dark:text-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    const paymentAmount = parseFloat(editableAmount) || 0;
                    
                    if (selectedPayment?.isCapitalPayment) {
                      // Handle capital payment (abono a capital)
                      if (paymentAmount <= 0) {
                        alert("El monto del abono debe ser mayor a 0");
                        setActionLoading(false);
                        return;
                      }

                      // Make API call for capital payment - this usually goes to contracts endpoint
                      const response = await fetch(
                        `${API_URL}/api/v1/projects/${currentContract?.project_id}/lots/${currentContract?.lot_id}/contracts/${currentContract?.id}/capital_repayment`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            contract: {
                              capital_repayment_amount: paymentAmount
                            }
                          }),
                        }
                      );

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
                      }

                      const data = await response.json();
                      
                      // Handle the capital payment response and update balance locally
                      // Since capital repayment reduces the balance, subtract the payment amount
                      setCurrentContract(prev => ({
                        ...(prev || {}),
                        balance: (prev?.balance || 0) - paymentAmount
                      }));
                      
                      // Call the original callback if provided
                      if (onPaymentSuccess) {
                        onPaymentSuccess({
                          payment: {
                            amount: paymentAmount,
                            contract: {
                              id: currentContract?.id,
                              balance: (currentContract?.balance || 0) - paymentAmount,
                              status: currentContract?.status,
                              created_at: currentContract?.created_at,
                              currency: currentContract?.currency || "HNL"
                            }
                          }
                        });
                      }
                      
                    } else {
                      // Handle regular payment - Make API call to apply payment
                      const interestAmount = parseFloat(editableInterest) || 0;
                      const paidAmount = parseFloat(editableTotal) || 0;

                      if (paidAmount <= 0) {
                        alert("El monto total debe ser mayor a 0");
                        setActionLoading(false);
                        return;
                      }

                      // Make API call to approve payment
                      const response = await fetch(
                        `${API_URL}/api/v1/payments/${selectedPayment.id}/approve`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            payment: {
                              amount: parseFloat(editableAmount) || 0,
                              interest_amount: interestAmount,
                              paid_amount: paidAmount
                            }
                          }),
                        }
                      );

                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
                      }

                      const data = await response.json();
                      
                      // Update the payment in the local schedule
                      const safeSchedule = Array.isArray(schedule) ? schedule : [];
                      const updatedSchedule = safeSchedule.map(payment => 
                        payment.id === selectedPayment.id 
                          ? { 
                              ...payment, 
                              status: data.payment.status || 'paid',
                              paid_amount: data.payment.amount,
                              interest_amount: data.payment.interest_amount,
                              payment_date: data.payment.payment_date,
                              approved_at: data.payment.approved_at
                            }
                          : payment
                      );
                      setSchedule(updatedSchedule);
                      
                      // Handle the payment response and update balance
                      handlePaymentResponse(data);
                      
                    }
                    
                    // Show success feedback
                    const paymentType = selectedPayment?.isCapitalPayment ? "Abono a capital" : "Pago";
                    alert(`${paymentType} aplicado exitosamente`);
                    
                    setTimeout(() => {
                      setApplyPaymentModal(false);
                      setSelectedPayment(null);
                      setEditableAmount("");
                      setEditableInterest("");
                      setEditableTotal("");
                      setActionLoading(false);
                    }, 500);
                  } catch (error) {
                    console.error('Error applying payment:', error);
                    const paymentType = selectedPayment?.isCapitalPayment ? "abono a capital" : "pago";
                    alert(`Error al aplicar ${paymentType}: ${error.message}`);
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedPayment?.isCapitalPayment 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {actionLoading 
                  ? (selectedPayment?.isCapitalPayment ? "Aplicando Abono..." : "Aplicando...")
                  : (selectedPayment?.isCapitalPayment ? "Aplicar Abono" : "Aplicar Pago")
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Moratory Modal */}
      {editingMora && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white dark:bg-darkblack-600 rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Editar Mora
            </h4>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto de Mora
              </label>
              <input
                type="number"
                step="0.01"
                value={moratoryAmount}
                onChange={(e) => setMoratoryAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingMora(null);
                  setMoratoryAmount("");
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-gray-800 dark:text-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Handle moratory amount update logic here
                  const safeSchedule = Array.isArray(schedule) ? schedule : [];
                  const updatedSchedule = safeSchedule.map(payment => 
                    (payment.id || safeSchedule.indexOf(payment)) === editingMora
                      ? { 
                          ...payment, 
                          interest_amount: parseFloat(moratoryAmount) || 0,
                          updated_date: new Date().toISOString().split('T')[0]
                        }
                      : payment
                  );
                  setSchedule(updatedSchedule);
                  
                  setEditingMora(null);
                  setMoratoryAmount("");
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Actualizar Mora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

PaymentScheduleModal.propTypes = {
  contract: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onPaymentSuccess: PropTypes.func,
};

export default PaymentScheduleModal;