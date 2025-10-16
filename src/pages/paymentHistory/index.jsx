import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { getToken } from '../../../auth';
import { API_URL } from '../../../config';
import { useLocale } from '../../contexts/LocaleContext';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import useDebounce from '../../utils/useDebounce';

// Components
import PaymentHeader from './components/PaymentHeader';
import SummaryCards from './components/SummaryCards';
import FiltersSection from './components/FiltersSection';
import PaymentTable from './components/PaymentTable';
import PaymentMobileList from './components/PaymentMobileList';
import PaymentDetailModal from './components/PaymentDetailModal';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import Pagination from './components/Pagination';

function PaymentHistory() {
  const { t, locale } = useLocale();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Summary metrics
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [countPaidDone, setCountPaidDone] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  
  // Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Utility functions
  const formatCurrency = (amount, currency = 'MXN') => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'PPP', {
        locale: locale === 'es' ? es : enUS,
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getPaymentTypeIcon = (type) => {
    const icons = {
      reserve: '🔒',
      down_payment: '💰',
      installment: '📅',
      capital_repayment: '💳',
    };
    return icons[type] || '💵';
  };

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token || !user?.id) {
          navigate('/signin');
          return;
        }

        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: perPage.toString(),
        });

        if (debouncedSearchTerm) params.append('search_term', debouncedSearchTerm);
        if (statusFilter) params.append('status', statusFilter);
        if (paymentTypeFilter) params.append('payment_type', paymentTypeFilter);
        if (dateRangeFilter !== 'all') params.append('date_range', dateRangeFilter);

        const response = await fetch(
          `${API_URL}/api/v1/users/${user.id}/payment_history?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(t('paymentHistory.fetchError'));
        }

        const data = await response.json();
        
        setPayments(data.payments || []);
        setTotal(data.total || 0);
        setBalance(data.balance || 0);
        setOverdueAmount(data.overdue_amount || 0);
        setPaymentCount(data.payment_count || 0);
        setCountPaidDone(data.count_paid_done || 0);
        setTotalPages(data.meta?.total_pages || 1);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, navigate, currentPage, perPage, debouncedSearchTerm, statusFilter, paymentTypeFilter, dateRangeFilter, t]);

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  return (
    <main className="w-full px-3 sm:px-6 pb-6 pt-[80px] xs:pt-[90px] sm:pt-[100px] md:pt-[120px] lg:pt-[156px] xl:px-12 xl:pb-12">
      <PaymentHeader />

      <SummaryCards
        total={total}
        balance={balance}
        paymentCount={paymentCount}
        countPaidDone={countPaidDone}
        overdueAmount={overdueAmount}
        formatCurrency={formatCurrency}
      />

      <FiltersSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentTypeFilter={paymentTypeFilter}
        setPaymentTypeFilter={setPaymentTypeFilter}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
      />

      {loading && <LoadingState />}
      {error && !loading && <ErrorState error={error} />}
      {!loading && !error && payments.length === 0 && <EmptyState />}

      {!loading && !error && payments.length > 0 && (
        <div className="bg-white dark:bg-darkblack-600 rounded-lg shadow-md border border-gray-200 dark:border-darkblack-400 overflow-hidden">
          <PaymentTable
            payments={payments}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            getPaymentTypeIcon={getPaymentTypeIcon}
            onViewDetails={handleViewDetails}
          />
          <PaymentMobileList
            payments={payments}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            getPaymentTypeIcon={getPaymentTypeIcon}
            onViewDetails={handleViewDetails}
          />
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={(newPerPage) => {
          setPerPage(newPerPage);
          setCurrentPage(1); // Reset to first page when changing items per page
        }}
      />

      {showDetailModal && selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={handleCloseModal}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getPaymentTypeIcon={getPaymentTypeIcon}
        />
      )}
    </main>
  );
}

export default PaymentHistory;
