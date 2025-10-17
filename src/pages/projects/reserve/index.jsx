import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../../../config";
import MessageEditor from "../../../component/editor/MessageEditor";
import AuthContext from "../../../context/AuthContext";
import Toast from "../../../component/ui/Toast";
import debounce from "lodash.debounce";
import { useLocale } from "../../../contexts/LocaleContext";

function Reserve() {
  const { t } = useLocale();
  const { id, lot_id } = useParams();
  const [paymentTerm, setPaymentTerm] = useState(12);
  const [financingType, setFinancingType] = useState("direct");
  const [reserveAmount, setReserveAmount] = useState("");
  const [downPayment, setDownPayment] = useState(""); // prima
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [rtn, setRtn] = useState("");
  const [email, setEmail] = useState("");
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  // Contract notes state
  const [contractNotes, setContractNotes] = useState("");

  // User search states
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userMode, setUserMode] = useState("search"); // "search" | "create"

  // NEW state for richer header details
  const [lotName, setLotName] = useState(null);
  const [lotPrice, setLotPrice] = useState(0);
  const [lotLength, setLotLength] = useState(null);
  const [lotWidth, setLotWidth] = useState(null);
  const [lotStatus, setLotStatus] = useState("");
  const [lotMeasurementUnit, setLotMeasurementUnit] = useState("m2");
  const [projectMeasurementUnit, setProjectMeasurementUnit] = useState("m2");
  const [projectName, setProjectName] = useState("");
  const [projectPricePerUnit, setProjectPricePerUnit] = useState(null);
  const [projectInterestRate, setProjectInterestRate] = useState(null);
  const [projectCommissionRate, setProjectCommissionRate] = useState(null);
  const [projectType, setProjectType] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [headerLoading, setHeaderLoading] = useState(true);

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // --- Fetch lot + project extra details (replaces earlier simple lot fetch if present) ---
  useEffect(() => {
    let cancelled = false;
    async function fetchHeader() {
      if (!id || !lot_id || !token) return;
      setHeaderLoading(true);
      try {
        const [lotRes, projRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/projects/${id}/lots/${lot_id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/v1/projects/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!lotRes.ok) throw new Error(t('reservations.errorFetchingLot'));
        if (!projRes.ok) throw new Error(t('reservations.errorFetchingProject'));

        const lotData = await lotRes.json();
        const projData = await projRes.json();
        if (cancelled) return;

        setLotName(lotData.name || `Lote ${lot_id}`);
        setLotPrice(lotData.price);
        setLotLength(lotData.length);
        setLotWidth(lotData.width);
        setLotStatus(lotData.status || "");
        setLotMeasurementUnit(lotData.measurement_unit || lotData.unit || projData.measurement_unit || "m2");

        setProjectName(projData.name || "");
        setProjectMeasurementUnit(projData.measurement_unit || "m2");
        setProjectPricePerUnit(projData.price_per_square_unit);
        setProjectInterestRate(projData.interest_rate);
        setProjectCommissionRate(projData.commission_rate);
        setProjectType(projData.project_type || "");
        setProjectAddress(projData.address || "");
      } catch (e) {
        // silently keep old minimal header if failure
        console.error(e);
      } finally {
        if (!cancelled) setHeaderLoading(false);
      }
    }
    fetchHeader();
    return () => { cancelled = true; };
  }, [id, lot_id, token]);

  // Update defaults & visibility when financing type changes
  useEffect(() => {
    if (financingType === "bank") {
      setPaymentTerm(6); // default but hidden
      // prima shown but not required, default 0 if empty
      if (downPayment === "" || downPayment === null) setDownPayment("0");
    } else if (financingType === "cash") {
      setPaymentTerm(2); // default but hidden
      if (downPayment === "" || downPayment === null) setDownPayment("0");
    } else {
      // direct
      setPaymentTerm((pt) => (pt && pt > 0 ? pt : 12));
      // keep downPayment if already present, otherwise empty
      if (downPayment === "" || downPayment === null) setDownPayment("");
    }
  }, [financingType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce the search function to limit API calls
  const debouncedSearch = useCallback(
    debounce((query) => {
      setCurrentPage(1); // Reset to first page on new search
      handleUserSearch(query, 1);
    }, 500),
    [] // stable
  );

  const handleQueryChange = (query) => {
    setUserQuery(query);
    if (query.length > 2) {
      debouncedSearch(query);
    } else {
      setUserResults([]);
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  const handleUserSearch = async (query, page = 1) => {
    if (query.length > 2) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/v1/users?search_term=${encodeURIComponent(query)}&role=user&page=${page}&per_page=10`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error searching users.");
        }

        const data = await response.json();
        const fetchedUsers = data.users || [];
        const pagination = data.pagination || {};

        if (page === 1) {
          setUserResults(fetchedUsers);
        } else {
          setUserResults((prevUsers) => [...prevUsers, ...fetchedUsers]);
        }

        setTotalPages(pagination.pages || 1);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error searching users:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setUserResults([]);
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      handleUserSearch(userQuery, nextPage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);

    // Basic client-side validation per financing type
    const errors = [];
    if (!reserveAmount || Number(reserveAmount) <= 0) {
      errors.push(t('reservations.reserveAmountRequired'));
    }

    if (financingType === "direct") {
      if (!paymentTerm || Number(paymentTerm) <= 0) {
        errors.push(t('reservations.paymentTermRequired'));
      }
      if (!downPayment || Number(downPayment) < 0) {
        errors.push(t('reservations.downPaymentRequired'));
      }
    } else {
      // bank or cash: prima displayed but not required (defaults handled)
      if (downPayment === "" || downPayment === null) setDownPayment("0");
    }

    if (errors.length) {
      setError(errors.join(" "));
      setFormSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("contract[payment_term]", paymentTerm);
    formData.append("contract[financing_type]", financingType);
    formData.append("contract[reserve_amount]", reserveAmount);
    formData.append("contract[down_payment]", downPayment || "0");
    formData.append("contract[note]", contractNotes);
    formData.append("contract[applicant_user_id]", selectedUser?.id || 0); // Use 0 if creating a new user
    formData.append("user[full_name]", fullName);
    formData.append("user[phone]", phone);
    formData.append("user[identity]", identity);
    formData.append("user[rtn]", rtn);
    formData.append("user[email]", email);

    documents.forEach((doc, index) => {
      formData.append(`documents[${index}]`, doc);
    });
    
    try {
      const response = await fetch(`${API_URL}/api/v1/projects/${id}/lots/${lot_id}/contracts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData.error || "") + ", " + t('reservations.errorCreatingContract'));
      }

      setToast({ visible: true, message: t('reservations.contractCreatedSuccess'), type: "success" });
      navigate(`/projects/${id}/lots`);
    } catch (err) {
      setError(err.message || t('reservations.errorCreatingContract'));
      setError(err.errors.join(" "));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  const switchMode = (mode) => {
    setUserMode(mode);
    if (mode === "create") {
      // Clean any selected existing user so fields are editable
      setSelectedUser(null);
      if (!fullName && !phone && !email) {
        // keep any already typed partial info
      }
    } else if (mode === "search") {
      // keep typed data but disable editing if a user gets selected later
    }
  };

  const handleUserSelect = (user) => {
    setFullName(user.full_name);
    setPhone(user.phone);
    setIdentity(user.identity);
    setRtn(user.rtn);
    setEmail(user.email);
    setSelectedUser(user);
    setUserResults([]);
    setCurrentPage(1);
    setTotalPages(1);
    setUserMode("search");
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setFullName("");
    setPhone("");
    setIdentity("");
    setRtn("");
    setEmail("");
  };

  // Derived lot area (raw) for header only (do not interfere with existing form logic)
  const headerArea = useMemo(() => {
    if (!lotLength || !lotWidth) return null;
    return Number(lotLength) * Number(lotWidth);
  }, [lotLength, lotWidth]);

  // ===== Real-time financial calculations (derived) =====
  const {
    numericReserve,
    numericDownPayment,
    financedAmount,
    monthlyPayment,
    totalInitial,
  } = useMemo(() => {
    const lot = typeof lotPrice === "number" ? lotPrice : parseFloat(lotPrice);
    const reserveNum = parseFloat(reserveAmount) || 0;
    const downNum = parseFloat(downPayment) || 0;
    const initial = reserveNum + downNum;

    const financed =
      lot && !isNaN(lot)
        ? Math.max(lot - initial, 0)
        : null;

    const months = parseInt(paymentTerm, 10) > 0 ? parseInt(paymentTerm, 10) : null;
    const monthly =
      financed !== null && months
        ? financed / months
        : null;

    return {
      numericReserve: reserveNum,
      numericDownPayment: downNum,
      financedAmount: financed,
      monthlyPayment: monthly,
      totalInitial: initial
    };
  }, [lotPrice, reserveAmount, downPayment, paymentTerm]);

  const formatCurrency = (v) => {
    if (v === null || v === undefined || isNaN(v)) return "—";
    return Number(v).toLocaleString(undefined, {
      style: "currency",
      currency: "HNL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper formatters
  const fmtNum = (v) => (v === null || v === undefined || v === "" ? "—" : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 }));
  const fmtPerc = (v) => (v === null || v === undefined ? "—" : `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`);
  const statusBadge = (s) => {
    const base = "px-2 py-0.5 rounded text-xs font-semibold";
    if (!s) return <span className={`${base} bg-gray-100 text-gray-600`}>—</span>;
    const normalized = s.toLowerCase();
    if (normalized === "available") return <span className={`${base} bg-green-100 text-green-700`}>{t('lots.available')}</span>;
    if (normalized === "reserved") return <span className={`${base} bg-yellow-100 text-yellow-700`}>{t('lots.reserved')}</span>;
    return <span className={`${base} bg-gray-100 text-gray-600`}>{s}</span>;
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="max-w-5xl mx-auto bg-white dark:bg-darkblack-600 p-8 shadow-lg rounded-lg">
        {/* Enhanced Header */}
        <div className="mb-6 border-b border-bgray-200 dark:border-darkblack-400 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-bgray-900 dark:text-white">
                {t('reservations.title')}
              </h2>
              {!headerLoading && (
                <p className="mt-1 text-sm text-bgray-600 dark:text-bgray-50">
                  {t('reservations.project')}: <span className="font-semibold">{projectName || "—"}</span>
                  {projectType && <> • {t('reservations.type')}: {projectType}</>}
                  {projectAddress && <> • {t('reservations.address')}: {projectAddress}</>}
                </p>
              )}
              {headerLoading && (
                <p className="mt-1 text-sm text-bgray-400 dark:text-bgray-400">
                  {t('reservations.loadingInfo')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-md bg-bgray-50 dark:bg-darkblack-500">
                <p className="uppercase tracking-wide text-bgray-500 dark:text-bgray-400 font-medium mb-1">
                  {t('reservations.lot')}
                </p>
                <p className="text-bgray-900 dark:text-white font-semibold">
                  {lotName || `Lote ${lot_id}`}
                </p>
              </div>
              <div className="p-3 rounded-md bg-bgray-50 dark:bg-darkblack-500">
                <p className="uppercase tracking-wide text-bgray-500 dark:text-bgray-400 font-medium mb-1">
                  {t('reservations.dimensions')}
                </p>
                <p className="text-bgray-900 dark:text-white font-semibold">
                  {lotLength && lotWidth
                    ? `${fmtNum(lotLength)} × ${fmtNum(lotWidth)} ${lotMeasurementUnit}`
                    : "—"}
                </p>
              </div>
              <div className="p-3 rounded-md bg-bgray-50 dark:bg-darkblack-500">
                <p className="uppercase tracking-wide text-bgray-500 dark:text-bgray-400 font-medium mb-1">
                  {t('reservations.area')}
                </p>
                <p className="text-bgray-900 dark:text-white font-semibold">
                  {headerArea != null
                    ? `${fmtNum(headerArea)} ${lotMeasurementUnit}`
                    : "—"}
                </p>
              </div>
              <div className="p-3 rounded-md bg-bgray-50 dark:bg-darkblack-500">
                <p className="uppercase tracking-wide text-bgray-500 dark:text-bgray-400 font-medium mb-1">
                  {t('reservations.lotPrice')}
                </p>
                <p className="text-bgray-900 dark:text-white font-semibold">
                  {lotPrice != null ? `${fmtNum(lotPrice)} HNL` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-md bg-bgray-50 dark:bg-darkblack-500">
                <p className="uppercase tracking-wide text-bgray-500 dark:text-bgray-400 font-medium mb-1">
                  {t('reservations.baseUnitPrice')}
                </p>
                <p className="text-bgray-900 dark:text-white font-semibold">
                  {projectPricePerUnit != null
                    ? `${fmtNum(projectPricePerUnit)} HNL / ${projectMeasurementUnit}`
                    : "—"}
                </p>
              </div>
              <div className="p-3 rounded-md bg-bgray-50 dark:bg-darkblack-500">
                <p className="uppercase tracking-wide text-bgray-500 dark:text-bgray-400 font-medium mb-1">
                  {t('reservations.status')}
                </p>
                <div>{statusBadge(lotStatus)}</div>
              </div>
              <div className="p-3 rounded-md bg-bgray-50 dark:bg-darkblack-500">
                <p className="uppercase tracking-wide text-bgray-500 dark:text-bgray-400 font-medium mb-1">
                  {t('reservations.interest')}
                </p>
                <p className="text-bgray-900 dark:text-white font-semibold">
                  {fmtPerc(projectInterestRate)}
                </p>
              </div>
              <div className="p-3 rounded-md bg-bgray-50 dark:bg-darkblack-500">
                <p className="uppercase tracking-wide text-bgray-500 dark:text-bgray-400 font-medium mb-1">
                  {t('reservations.commission')}
                </p>
                <p className="text-bgray-900 dark:text-white font-semibold">
                  {fmtPerc(projectCommissionRate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-0">
          <form onSubmit={handleSubmit}>
            <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-10">
              {/* ------------ LEFT COLUMN: FINANCING ------------- */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-bgray-900 dark:text-white">
                  {t('reservations.financingType')}
                </h4>

                <div className="flex flex-col gap-2">
                  <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">
                    {t('reservations.financingType')}
                  </label>
                  <select
                    value={financingType}
                    onChange={(e) => setFinancingType(e.target.value)}
                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:ring-2 focus:ring-success-300"
                  >
                    <option value="direct">{t('reservations.direct')}</option>
                    <option value="bank">{t('reservations.bank')}</option>
                    <option value="cash">{t('reservations.cash')}</option>
                  </select>
                  <p className="text-xs text-bgray-500 dark:text-bgray-300 mt-1">
                    {t('reservations.financingDescription')}
                  </p>
                </div>

                {financingType === "direct" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-base text-bgray-600 dark:text-bgray-50">
                      {t('reservations.paymentTerm')}
                    </label>
                    <input
                      type="number"
                      value={paymentTerm}
                      onChange={(e) => setPaymentTerm(e.target.value)}
                      className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:ring-2 focus:ring-success-300"
                      required
                      min={1}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">
                    {t('reservations.reserveAmount')}
                  </label>
                  <input
                    type="number"
                    value={reserveAmount}
                    onChange={(e) => setReserveAmount(e.target.value)}
                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:ring-2 focus:ring-success-300"
                    required
                    min={1}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">
                    {t('reservations.downPayment')}
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-lg h-14 border-0 focus:ring-2 focus:ring-success-300"
                    placeholder={
                      financingType === "direct"
                        ? t('reservations.requiredForDirect')
                        : t('reservations.optionalDefaultZero')
                    }
                    required={financingType === "direct"}
                    min={0}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base text-bgray-600 dark:text-bgray-50 font-medium">
                    {t('reservations.notes')}
                  </label>
                  <div className="rounded-lg overflow-hidden border border-bgray-200 dark:border-darkblack-400">
                    <MessageEditor onTextChange={setContractNotes} />
                  </div>
                </div>

                {/* ===== Real-time Balance Summary Card ===== */}
                <div className="mt-4 border border-bgray-200 dark:border-darkblack-400 rounded-lg p-5 bg-bgray-50 dark:bg-darkblack-600">
                  <h5 className="text-sm font-semibold text-bgray-700 dark:text-bgray-100 mb-3 tracking-wide">
                    {t('reservations.financialSummary')}
                  </h5>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <dt className="text-bgray-500 dark:text-bgray-300">{t('reservations.lotPrice')}</dt>
                      <dd className="font-medium text-bgray-900 dark:text-white">
                        {formatCurrency(lotPrice)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-bgray-500 dark:text-bgray-300">{t('reservations.reservation')}</dt>
                      <dd className="font-medium text-bgray-900 dark:text-white">
                        {formatCurrency(numericReserve)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-bgray-500 dark:text-bgray-300">{t('reservations.downPaymentLabel')}</dt>
                      <dd className="font-medium text-bgray-900 dark:text-white">
                        {formatCurrency(numericDownPayment)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-bgray-500 dark:text-bgray-300">{t('reservations.initialContribution')}</dt>
                      <dd className="font-medium text-bgray-900 dark:text-white">
                        {formatCurrency(totalInitial)}
                      </dd>
                    </div>
                    <div className="col-span-2 border-t border-bgray-200 dark:border-darkblack-500 pt-3">
                      <dt className="text-bgray-500 dark:text-bgray-300">{t('reservations.financedAmount')}</dt>
                      <dd className="text-lg font-semibold text-success-600 dark:text-success-400">
                        {formatCurrency(financedAmount)}
                      </dd>
                    </div>
                    {financingType === "direct" && (
                      <div className="col-span-2 flex justify-between items-center">
                        <span className="text-bgray-500 dark:text-bgray-300">
                          {t('reservations.estimatedMonthly')}
                        </span>
                        <span className="text-sm font-semibold text-bgray-900 dark:text-white">
                          {formatCurrency(monthlyPayment)}
                        </span>
                      </div>
                    )}
                  </dl>
                  <p className="mt-3 text-[10px] leading-4 text-bgray-400 dark:text-bgray-400">
                    {t('reservations.calculationNote')}
                  </p>
                </div>
              </div>

              {/* ------------ RIGHT COLUMN: CUSTOMER INFO ------------- */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-bgray-900 dark:text-white">
                    {t('reservations.clientInformation')}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => switchMode("search")}
                      className={
                        "px-4 py-2 rounded-md text-sm font-medium transition " +
                        (userMode === "search"
                          ? "bg-success-300 text-white shadow"
                          : "bg-bgray-100 dark:bg-darkblack-600 text-bgray-600 dark:text-bgray-300 hover:bg-bgray-200 dark:hover:bg-darkblack-500")
                      }
                    >
                      {t('reservations.search')}
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("create")}
                      className={
                        "px-4 py-2 rounded-md text-sm font-medium transition " +
                        (userMode === "create"
                          ? "bg-success-300 text-white shadow"
                          : "bg-bgray-100 dark:bg-darkblack-600 text-bgray-600 dark:text-bgray-300 hover:bg-bgray-200 dark:hover:bg-darkblack-500")
                      }
                    >
                      {t('reservations.new')}
                    </button>
                  </div>
                </div>

                {/* MODE: SEARCH EXISTING USER */}
                {userMode === "search" && (
                  <div className="space-y-3">
                    {!selectedUser && (
                      <>
                        <div className="relative">
                          <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white pl-11 pr-4 p-4 rounded-lg h-14 w-full border-0 focus:ring-2 focus:ring-success-300"
                            placeholder={t('reservations.searchByNamePhoneEmail')}
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute left-3 top-3.5 h-7 w-7 text-success-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-4.35-4.35M16.65 9.9a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
                            />
                          </svg>
                        </div>

                        {userResults.length > 0 && (
                          <div className="bg-white dark:bg-darkblack-600 border border-bgray-200 dark:border-darkblack-400 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-sm">
                            {userResults.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleUserSelect(u)}
                                className="w-full text-left px-4 py-2 hover:bg-success-50 dark:hover:bg-darkblack-500 flex justify-between items-center text-bgray-900 dark:text-white"
                              >
                                <span className="text-sm">
                                  <span className="font-medium">{u.full_name}</span>{" "}
                                  <span className="text-bgray-400 dark:text-bgray-300">• {u.email}</span>
                                </span>
                                <span className="text-xs text-bgray-400 dark:text-bgray-300">
                                  {u.phone}
                                </span>
                              </button>
                            ))}
                            {currentPage < totalPages && (
                              <button
                                type="button"
                                onClick={handleLoadMore}
                                className="w-full text-center text-sm py-2 bg-bgray-50 dark:bg-darkblack-500 hover:bg-bgray-100 dark:hover:bg-darkblack-400 text-bgray-700 dark:text-bgray-200"
                                disabled={isLoading}
                              >
                                {isLoading ? t('reservations.loading') : t('reservations.loadMore')}
                              </button>
                            )}
                          </div>
                        )}
                        {isLoading && userResults.length === 0 && (
                          <p className="text-sm text-bgray-500">
                            {t('reservations.searchingUsers')}
                          </p>
                        )}
                        {userQuery.length <= 2 && (
                          <p className="text-xs text-bgray-400">
                            {t('reservations.typeAtLeast3Chars')}
                          </p>
                        )}
                      </>
                    )}

                    {selectedUser && (
                      <div className="p-4 rounded-lg bg-success-50 dark:bg-darkblack-500 border border-success-200 dark:border-darkblack-400 flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-bgray-900 dark:text-white">
                            {selectedUser.full_name}
                          </p>
                          <p className="text-xs text-bgray-500 dark:text-bgray-300">
                            {selectedUser.email} • {selectedUser.phone}
                          </p>
                          <p className="text-xs text-bgray-400 dark:text-bgray-400 mt-1">
                            ID: {selectedUser.identity || "—"} | RTN:{" "}
                            {selectedUser.rtn || "—"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={clearSelectedUser}
                            className="text-xs text-red-500 hover:underline"
                          >
                            {t('reservations.remove')}
                          </button>
                          <button
                            type="button"
                            onClick={() => switchMode("create")}
                            className="text-xs text-success-600 hover:underline"
                          >
                            {t('reservations.new')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE: CREATE NEW USER INLINE */}
                {userMode === "create" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-bgray-600 dark:text-bgray-300">
                        {t('reservations.completeNewClientData')}
                      </p>
                      {selectedUser && (
                        <button
                          type="button"
                          onClick={clearSelectedUser}
                          className="text-xs text-red-500 hover:underline"
                        >
                          {t('reservations.clear')}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-bgray-600 dark:text-bgray-50">
                          {t('reservations.fullName')}
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-3 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-bgray-600 dark:text-bgray-50">
                          {t('reservations.phone')}
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-3 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-bgray-600 dark:text-bgray-50">
                          {t('reservations.identity')}
                        </label>
                        <input
                          type="text"
                          value={identity}
                          onChange={(e) => setIdentity(e.target.value)}
                          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-3 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-bgray-600 dark:text-bgray-50">
                          {t('reservations.rtn')}
                        </label>
                        <input
                          type="text"
                          value={rtn}
                          onChange={(e) => setRtn(e.target.value)}
                          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-3 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-medium text-bgray-600 dark:text-bgray-50">
                          {t('reservations.email')}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-3 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-medium text-bgray-600 dark:text-bgray-50">
                          {t('reservations.documents')}
                        </label>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          multiple
                          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-3 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => switchMode("search")}
                        className="text-sm text-bgray-600 dark:text-bgray-300 hover:underline"
                      >
                        {t('reservations.searchExisting')}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-red-500 text-sm pt-2">{error}</p>
                )}
              </div>
              {/* ------------ END CUSTOMER COLUMN ------------- */}
            </div>

            <div className="flex justify-between">
              <button
                aria-label="none"
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white mt-10 py-3.5 px-4 rounded-lg"
              >
                {t('common.back')}
              </button>
              <button
                type="submit"
                className={`bg-success-300 hover:bg-green-600 dark:bg-success-400 dark:hover:bg-green-700 text-white mt-10 py-3.5 px-4 rounded-lg ${
                  formSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={formSubmitting}
              >
                {formSubmitting ? t('reservations.creating') : t('reservations.createRequest')}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((s) => ({ ...s, visible: false }))} />
    </main>
  );
}

export default Reserve;