import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";

function PaymentScheduleModal({ contract, open, onClose, onPaymentSuccess }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMora, setEditingMora] = useState(null);
  const [moratoryAmount, setMoratoryAmount] = useState("");
  const [applyPaymentModal, setApplyPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editableAmount, setEditableAmount] = useState("");
  const [editableInterest, setEditableInterest] = useState("");
  const token = getToken();

  // Build synthetic schedule (fallback when no payment_schedule present)
  const buildSynthetic = (c) => {
    if (!c) return [];
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
        due_date: startDate.toISOString().split('T')[0], // Same as contract date
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
        // Set due date to next month
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
  };

  // Load payment schedule from contract or build synthetic
  const loadPaymentSchedule = () => {
    if (!contract) return;
    
    setLoading(true);
    
    // Use payment_schedule from contract if available
    if (contract.payment_schedule && Array.isArray(contract.payment_schedule) && contract.payment_schedule.length > 0) {
      setSchedule(contract.payment_schedule);
    } else {
      // Fallback to synthetic schedule
      const synthetic = buildSynthetic(contract);
      setSchedule(synthetic);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (!open || !contract) return;
    loadPaymentSchedule();
  }, [open, contract]);

  // Calculate customer credit score based on payment behavior
  const calculateCreditScore = useMemo(() => {
    if (!schedule.length) return 7;
    
    const today = new Date();
    
    // Find the first payment due date to establish the payment history period
    const firstPaymentDate = schedule
      .filter(p => p.due_date)
      .map(p => new Date(p.due_date))
      .sort((a, b) => a - b)[0];
    
    // If no payment dates or first payment is in the future, return neutral score
    if (!firstPaymentDate || firstPaymentDate > today) {
      return 7; // Good starting score - no payment history yet
    }
    
    // Only consider payments that are due from first payment date until today
    const relevantPayments = schedule.filter(p => {
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
    const subtotal = schedule.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalInterest = schedule.reduce((sum, payment) => sum + Number(payment.interest_amount || 0), 0);
    const total = subtotal + totalInterest;
    
    return { subtotal, totalInterest, total };
  }, [schedule]);

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
      default: return type || "Cuota"; // Return original type if no match
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

  // Open apply payment modal with editable fields
  const openApplyPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setEditableAmount(payment.amount || payment.value || payment.payment_amount || 0);
    setEditableInterest(payment.interest_amount || 0);
    setApplyPaymentModal(true);
  };

  // Apply payment with edited values
  const handleApplyPayment = async () => {
    if (!selectedPayment) return;

    const amount = Number(editableAmount);
    const interest = Number(editableInterest);
    const totalAmount = amount + interest;

    if (amount <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/payments/${selectedPayment.id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: amount,
            interest_amount: interest,
            total_amount: totalAmount
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update the payment in the local schedule instead of full refresh
        setSchedule(prevSchedule => 
          prevSchedule.map(payment => 
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
          )
        );
        setApplyPaymentModal(false);
        setSelectedPayment(null);
        // Notify parent component with the updated payment data (no full refresh needed)
        if (onPaymentSuccess) {
          onPaymentSuccess(data.payment);
        }
        alert("Pago aplicado exitosamente.");
      } else {
        throw new Error("Error aplicando el pago");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Undo a transaction
  const handleUndoTransaction = async (paymentId) => {
    if (!window.confirm("¿Está seguro de que desea deshacer esta transacción?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/payments/${paymentId}/undo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update the payment in the local schedule instead of full refresh
        setSchedule(prevSchedule => 
          prevSchedule.map(payment => 
            payment.id === paymentId 
              ? { 
                  ...payment, 
                  status: 'pending', // Reset to pending after undo
                  paid_amount: 0,
                  payment_date: null,
                  approved_at: null
                }
              : payment
          )
        );
        // Notify parent component with the updated payment data (no full refresh needed)
        if (onPaymentSuccess) {
          onPaymentSuccess(data.payment || { id: paymentId, status: 'pending' });
        }
        alert("Transacción deshecha exitosamente.");
      } else {
        throw new Error("Error deshaciendo la transacción");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Edit interest amount
  const handleEditInterest = async (paymentId, newAmount) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/payments/${paymentId}/edit_interest`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            interest_amount: newAmount
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update the payment in the local schedule instead of full refresh
        setSchedule(prevSchedule => 
          prevSchedule.map(payment => 
            payment.id === paymentId 
              ? { 
                  ...payment, 
                  interest_amount: newAmount
                }
              : payment
          )
        );
        setEditingMora(null);
        setMoratoryAmount("");
        // Notify parent component with the updated payment data (no full refresh needed)
        if (onPaymentSuccess) {
          onPaymentSuccess(data.payment || { id: paymentId, interest_amount: newAmount });
        }
        alert("Interés actualizado exitosamente.");
      } else {
        throw new Error("Error actualizando el interés");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Close apply payment modal
  const closeApplyPaymentModal = () => {
    setApplyPaymentModal(false);
    setSelectedPayment(null);
    setEditableAmount("");
    setEditableInterest("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-6xl bg-white dark:bg-darkblack-600 rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-bgray-200 dark:border-darkblack-400">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-bgray-900 dark:text-white">Plan de Pagos</h3>
            <button
              onClick={onClose}
              className="text-bgray-500 hover:text-bgray-700 dark:text-bgray-300 dark:hover:text-white text-xl"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          
          {/* Modern Header Layout */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-darkblack-600 dark:via-darkblack-500 dark:to-darkblack-400 rounded-2xl opacity-60"></div>
            <div className="absolute inset-0 opacity-30 rounded-2xl" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
            
            <div className="relative p-6">
              <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                {/* Left Section - Contract Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-6">
                    {/* Contract Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-darkblack-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Contract Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          #{contract?.id}
                        </h3>
                        <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full shadow-sm">
                          {contract?.status || "ACTIVO"}
                        </div>
                      </div>
                      <p className="text-lg text-gray-700 dark:text-gray-200 font-medium mb-1">
                        {contract?.applicant_name || "Cliente"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1H3V9a2 2 0 012-2h3zM2 17a2 2 0 002 2h16a2 2 0 002-2v-7H2v7z" />
                        </svg>
                        Creado {contract?.created_at ? new Date(contract.created_at).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Project & Lot Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Project Card */}
                    <div className="group">
                      <div className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-darkblack-300/20 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proyecto</p>
                            <p className="font-bold text-gray-900 dark:text-white leading-tight">
                              {contract?.project_name || contract?.project?.name || "Sin nombre"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">ID: {contract?.project_id || "N/A"}</span>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Lot Card */}
                    <div className="group">
                      <div className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-darkblack-300/20 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lote</p>
                            <p className="font-bold text-gray-900 dark:text-white leading-tight">
                              {contract?.lot_name || contract?.lot?.name || `#${contract?.lot_id}` || "Sin nombre"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">ID: {contract?.lot_id || "N/A"}</span>
                          {contract?.lot_area ? (
                            <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                              {contract.lot_area} m²
                            </span>
                          ) : (
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Modern Credit Score Card */}
                <div className="xl:w-80">
                  <div className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-darkblack-300/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Score Crediticio</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Historial de pagos</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Display */}
                    <div className="relative mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative">
                          {/* Circular Progress Background */}
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${(calculateCreditScore / 10) * 314.16} 314.16`}
                              className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="50%" stopColor="#EC4899" />
                                <stop offset="100%" stopColor="#F59E0B" />
                              </linearGradient>
                            </defs>
                          </svg>
                          
                          {/* Score Number */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                                {calculateCreditScore}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                de 10
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="text-center mb-4">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getCreditScoreColor(calculateCreditScore)}`}>
                          {calculateCreditScore >= 8 ? "🌟 EXCELENTE" : 
                           calculateCreditScore >= 6 ? "⭐ BUENO" : 
                           "📈 NECESITA MEJORA"}
                        </span>
                      </div>
                      
                      {/* Score Details */}
                      <div className="bg-gray-50 dark:bg-darkblack-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Evaluación</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.ceil(calculateCreditScore / 2) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Score Crediticio</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Historial de pagos</p>
                </div>
              </div>
              
              {/* Score Display */}
              <div className="bg-white dark:bg-darkblack-600 rounded-lg p-3 border border-gray-100 dark:border-darkblack-400">
                <div className="flex items-center justify-between mb-3">
                  {/* Score Circle */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-600 flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-lg">
                      <span className="text-white font-bold text-xl">{calculateCreditScore}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-white">★</span>
                    </div>
                  </div>
                  
                  {/* Score Info */}
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{calculateCreditScore}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/10</span>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCreditScoreColor(calculateCreditScore)}`}>
                      {calculateCreditScore >= 8 ? "★★★ EXCELENTE" : 
                       calculateCreditScore >= 6 ? "★★ BUENO" : 
                       "★ NECESITA MEJORA"}
                    </span>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 transition-all duration-500 ease-out"
                        style={{ width: `${(calculateCreditScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="pt-2 border-t border-gray-100 dark:border-darkblack-400">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Basado en comportamiento de pago</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.floor(calculateCreditScore / 2))].map((_, i) => (
                        <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      {calculateCreditScore % 2 !== 0 && (
                        <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 px-6 py-4 text-xs border-b border-bgray-200 dark:border-darkblack-400">
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



        {/* Payment Schedule Table */}
        <div className="overflow-auto px-6 pb-6 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-bgray-500 dark:text-bgray-300">Cargando...</div>
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
                {schedule.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-bgray-500">
                      No hay plan disponible.
                    </td>
                  </tr>
                )}
                {schedule.map((row, idx) => {
                  const amount = row.amount || row.value || row.payment_amount;
                  const interest = row.interest_amount || 0;
                  const status = (row.status || "pending").toLowerCase();
                  const moratoryDays = row.overdue_days || row.moratory_days || calculateMoratoryDays(row.due_date);
                  
                  const getMoratoryDaysColor = (days) => {
                    if (days >= 90) return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
                    if (days >= 60) return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300";
                    if (days >= 30) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
                    return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
                  };

                  return (
                    <tr
                      key={row.id || idx}
                      className="border-b border-bgray-100 dark:border-darkblack-500 last:border-b-0 hover:bg-bgray-50 dark:hover:bg-darkblack-500"
                    >
                      <td className="py-3 pr-3 font-medium">{row.number || idx + 1}</td>
                      <td className="py-3 pr-3">
                        {row.due_date ? new Date(row.due_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="px-2 py-1 bg-bgray-100 dark:bg-darkblack-400 rounded text-xs">
                          {translatePaymentType(row.payment_type)}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-medium">{fmt(amount)}</td>
                      <td className="py-3 pr-3 text-right">
                        {editingMora === row.id ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              value={moratoryAmount}
                              onChange={(e) => setMoratoryAmount(e.target.value)}
                              className="w-20 px-2 py-1 border rounded text-xs"
                              step="0.01"
                            />
                            <button
                              onClick={() => handleEditInterest(row.id, moratoryAmount)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingMora(null);
                                setMoratoryAmount("");
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <span className="font-medium">{fmt(interest)}</span>
                            <button
                              onClick={() => {
                                setEditingMora(row.id);
                                setMoratoryAmount(interest.toString());
                              }}
                              className="text-bgray-500 hover:text-bgray-700 text-xs"
                              title="Editar interés"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoratoryDaysColor(moratoryDays)}`}>
                          {moratoryDays} días
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-[11px] font-semibold " +
                            (status === "paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : status === "overdue"
                              ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300")
                          }
                        >
                          {status === "paid" ? "Pagado" : status === "overdue" ? "Vencido" : "Pendiente"}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center justify-center space-x-2">
                          {status === "pending" && (
                            <button
                              onClick={() => openApplyPaymentModal(row)}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                              disabled={loading}
                            >
                              Aplicar
                            </button>
                          )}
                          {status === "paid" && (
                            <button
                              onClick={() => handleUndoTransaction(row.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                              disabled={loading}
                            >
                              Deshacer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Totals Row */}
                <tr className="border-t-2 border-bgray-300 dark:border-darkblack-300 bg-bgray-50 dark:bg-darkblack-500">
                  <td colSpan="3" className="py-3 pr-3 font-bold text-right">Subtotal:</td>
                  <td className="py-3 pr-3 text-right font-bold">{fmt(totals.subtotal)}</td>
                  <td className="py-3 pr-3 text-right font-bold text-success-600">{fmt(totals.totalInterest)}</td>
                  <td colSpan="3"></td>
                </tr>
                <tr className="bg-bgray-100 dark:bg-darkblack-400">
                  <td colSpan="3" className="py-3 pr-3 font-bold text-right text-lg">TOTAL:</td>
                  <td colSpan="2" className="py-3 pr-3 text-right font-bold text-lg text-bgray-900 dark:text-white">
                    {fmt(totals.total)}
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-bgray-200 dark:border-darkblack-400 flex justify-end">
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
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeApplyPaymentModal} />
          <div className="relative bg-white dark:bg-darkblack-600 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-bold text-bgray-900 dark:text-white mb-4">
              Aplicar Pago - Cuota #{selectedPayment.number || selectedPayment.id}
            </h4>
            
            {/* Payment Information */}
            <div className="mb-4 p-3 bg-bgray-50 dark:bg-darkblack-500 rounded-lg">
              <p className="text-sm text-bgray-600 dark:text-bgray-300 mb-1">
                <strong>Fecha vencimiento:</strong> {selectedPayment.due_date ? new Date(selectedPayment.due_date).toLocaleDateString() : "N/A"}
              </p>
              <p className="text-sm text-bgray-600 dark:text-bgray-300 mb-1">
                <strong>Tipo:</strong> {translatePaymentType(selectedPayment.payment_type)}
              </p>
              <p className="text-sm text-bgray-600 dark:text-bgray-300">
                <strong>Días de mora:</strong> {selectedPayment.overdue_days || selectedPayment.moratory_days || calculateMoratoryDays(selectedPayment.due_date)} días
              </p>
            </div>

            {/* Editable Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-bgray-700 dark:text-bgray-300 mb-2">
                Monto (HNL)
              </label>
              <input
                type="number"
                value={editableAmount}
                onChange={(e) => setEditableAmount(e.target.value)}
                className="w-full px-3 py-2 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {/* Editable Interest */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-bgray-700 dark:text-bgray-300 mb-2">
                Interés (HNL)
              </label>
              <input
                type="number"
                value={editableInterest}
                onChange={(e) => setEditableInterest(e.target.value)}
                className="w-full px-3 py-2 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {/* Total Display */}
            <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
              <p className="text-sm font-semibold text-success-700 dark:text-success-300">
                Total a aplicar: {fmt(Number(editableAmount) + Number(editableInterest))}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeApplyPaymentModal}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-bgray-200 hover:bg-bgray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-bgray-800 dark:text-bgray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyPayment}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white"
                disabled={loading || !editableAmount || Number(editableAmount) <= 0}
              >
                {loading ? "Aplicando..." : "Aplicar Pago"}
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