import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { formatStatus } from "../../utils/formatStatus";

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

  // Calculate customer credit score based on payment behavior
  const calculateCreditScore = useMemo(() => {
    const safeSchedule = Array.isArray(schedule) ? schedule : [];
    if (!safeSchedule.length) return 7;
    
    const today = new Date();
    
    // Find the first payment due date to establish the payment history period
    const firstPaymentDate = safeSchedule
      .filter(p => p.due_date)
      .map(p => new Date(p.due_date))
      .sort((a, b) => a - b)[0];
    
    // If no payment dates or first payment is in the future, return neutral score
    if (!firstPaymentDate || firstPaymentDate > today) {
      return 7; // Good starting score - no payment history yet
    }
    
    // Only consider payments that are due from first payment date until today
    const relevantPayments = safeSchedule.filter(p => {
      if (!p.due_date) return false;
      const dueDate = new Date(p.due_date);
      return dueDate >= firstPaymentDate && dueDate <= today;
    });
    
    // If no relevant payments in the history period, return neutral score
    if (relevantPayments.length === 0) return 7; // Good starting score for new contracts
    
    const paidPayments = relevantPayments.filter(p => p.status === "paid");
    const overduePayments = relevantPayments.filter(p => {
      if (p.status === "paid") return false;
      const dueDate = new Date(p.due_date);
      return today > dueDate; // Payment is overdue if today is past due date
    });
    
    const totalRelevantPayments = relevantPayments.length;
    const paidRatio = paidPayments.length / totalRelevantPayments;
    const overdueRatio = overduePayments.length / totalRelevantPayments;
    
    // If no payments are overdue and none are paid yet (all current), maintain good score
    if (overdueRatio === 0 && paidRatio === 0) {
      return 7; // Good score for current contracts with no issues
    }
    
    // Start with good score for active contracts
    let score = 8;
    
    // Penalize for overdue payments in the history period
    score -= (overdueRatio * 6); // -6 points per overdue payment ratio
    
    // Bonus for paid payments in the history period
    score += (paidRatio * 2); // +2 points bonus for paid payments ratio
    
    // Additional penalty if more than 30% of due payments are overdue
    if (overdueRatio > 0.3) {
      score -= 1; // Extra penalty for poor payment pattern
    }
    
    // Perfect payment history gets maximum score
    if (paidRatio === 1 && overdueRatio === 0 && totalRelevantPayments > 0) {
      score = 10; // Perfect score for perfect payment history
    }
    
    // Ensure score stays within 1-10 range
    score = Math.max(1, Math.min(10, Math.round(score)));
    
    return score;
  }, [schedule]);

  const getCreditScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
    if (score >= 6) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
    return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
  };

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
                {activeTab === 'payments' ? 'Plan de Pagos' : 'Asientos Contables'}
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
                <div className="flex items-start space-x-3 mb-4">
                  {/* Contract Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-darkblack-600 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Contract Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        Contrato #{currentContract?.id}
                      </h4>
                      <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full shadow-sm">
                        {formatStatus(currentContract?.status) || "ACTIVO"}
                      </div>
                    </div>
                    <p className="text-base text-gray-700 dark:text-gray-200 font-medium mb-1">
                      {currentContract?.applicant_name || "Cliente"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1H3V9a2 2 0 012-2h3zM2 17a2 2 0 002 2h16a2 2 0 002-2v-7H2v7z" />
                      </svg>
                      Creado {currentContract?.created_at ? new Date(currentContract.created_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : "N/A"}
                    </p>
                  </div>
                </div>
                
                {/* Project & Lot Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                  {/* Project Card */}
                  <div className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-darkblack-300/20 shadow-sm hover:shadow-md transition-all duration-200 h-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proyecto</p>
                        <p className="font-bold text-gray-900 dark:text-white leading-tight text-sm">
                          {currentContract?.project_name || currentContract?.project?.name || "Sin nombre"}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              ID: {currentContract?.project_id || "N/A"} · {currentContract?.project_address || currentContract?.project?.address || "Sin dirección"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lot Card */}
                  <div className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-darkblack-300/20 shadow-sm hover:shadow-md transition-all duration-200 h-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lote</p>
                        <p className="font-bold text-gray-900 dark:text-white leading-tight text-sm">
                          {currentContract?.lot_name || currentContract?.lot?.name || `#${currentContract?.lot_id}` || "Sin nombre"}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              ID: {currentContract?.lot_id || "N/A"} · {currentContract?.lot_address || currentContract?.lot?.address || "Sin dirección"}
                            </p>
                          </div>
                          {currentContract?.lot_area && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                              {currentContract.lot_area} m²
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Credit Score Card */}
              <div className="xl:col-span-1 h-full">
                <div className="h-full flex flex-col justify-between bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-darkblack-300/20 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Calificación Crediticia</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">basada en el comportamiento de pago</p>
                    </div>
                  </div>
                  
                  {/* Score Circle */}
                  <div className="flex items-center justify-center mb-2">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
                        <circle cx="50" cy="50" r="40" stroke="url(#scoreGradient)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${(calculateCreditScore / 10) * 251.2} 251.2`} className="transition-all duration-1000 ease-out" />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="50%" stopColor="#EC4899" />
                            <stop offset="100%" stopColor="#F59E0B" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{calculateCreditScore}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">de 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getCreditScoreColor(calculateCreditScore)}`}>
                      {calculateCreditScore >= 8 ? "★★★ EXCELENTE" : 
                       calculateCreditScore >= 6 ? "★★ BUENO" : 
                       "★ NECESITA MEJORA"}
                    </span>
                  </div>
                </div>
              </div>
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
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 px-4 py-3 text-xs border-b border-bgray-200 dark:border-darkblack-400">
            <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Precio</p>
              <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.price)}</p>
            </div>
            <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Reserva</p>
              <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.reserve)}</p>
            </div>
            <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Prima</p>
              <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.prima)}</p>
            </div>
            <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Financiado</p>
              <p className="font-semibold text-success-600 dark:text-success-400">{fmt(summary.financed)}</p>
            </div>
            <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Balance</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400">{fmt(currentContract?.balance)}</p>
            </div>
            <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Meses</p>
              <p className="font-semibold text-bgray-900 dark:text-white">{summary.term || "—"}</p>
            </div>
            <div className="p-2 rounded-lg bg-bgray-50 dark:bg-darkblack-500">
              <p className="text-bgray-500 dark:text-bgray-400">Cuota Est.</p>
              <p className="font-semibold text-bgray-900 dark:text-white">{fmt(summary.monthly)}</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="overflow-auto px-6 pb-6 flex-1">
          {activeTab === 'payments' ? (
            /* Payment Schedule Table */
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
          ) : (
            /* Ledger Entries Table */
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