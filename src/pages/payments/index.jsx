import { useState, useContext, useMemo, useCallback } from "react";
import SearchFilterBar from "../../component/ui/SearchFilterBar";
import GenericList from "../../component/ui/GenericList";
import PaymentItem from "../../component/balance/PaymentItem";
import AuthContext from "../../context/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";

function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  // Status filter options - memoized to prevent re-creation
  const statusOptions = useMemo(() => [
    { value: "", label: t('filters.all') },
    { value: "submitted", label: t('payments.statusOptions.submitted') },
    { value: "paid", label: t('payments.statusOptions.paid') }
  ], [t]);

  // Define columns for the desktop table view - memoized to prevent re-creation
  const columns = useMemo(() => [
    { label: t('payments.description'), align: "left", sortKey: "description" },
    { label: t('payments.applicant'), align: "left", sortKey: "applicant" },
    { label: t('payments.totalAmount'), align: "right", sortKey: "amount", defaultSortDirection: "desc" },
    { label: t('payments.dueDate'), align: "left", sortKey: "due_date", defaultSortDirection: "desc" },
    { label: t('common.status'), align: "left", sortKey: "status" },
    { label: t('common.actions'), align: "left" }
  ], [t]);

  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo(() => ({
    search_term: searchTerm,
    status: status || "[paid|submitted]"
  }), [searchTerm, status]);

  // Memoize refresh callback
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Render function for individual payment items - memoized to prevent re-creation
  const renderPaymentItem = useCallback((payment, index, isMobileCard, handleClick) => {
    return (
      <PaymentItem
        paymentInfo={payment}
        index={index}
        userRole={user?.role}
        refreshPayments={handleRefresh}
        onClick={() => handleClick(payment)}
        isMobileCard={isMobileCard}
      />
    );
  }, [user?.role, handleRefresh]);

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700">
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-10">
        <div className="2xl:flex-1 w-full">
          <SearchFilterBar
            searchTerm={searchTerm}
            filterValue={status}
            filterOptions={statusOptions}
            onSearchChange={setSearchTerm}
            onFilterChange={setStatus}
            searchPlaceholder={t('filters.searchPlaceholder')}
            filterPlaceholder={t('filters.statusPlaceholder')}
            minSearchLength={2}
            showFilter={true}
          />
          <GenericList
            endpoint="/api/v1/payments"
            renderItem={renderPaymentItem}
            filters={filters}
            columns={columns}
            sortBy="updated_at-desc"
            itemsPerPage={20}
            emptyMessage={t('payments.noPaymentsFound', { searchTerm: searchTerm, status: status })}
            loadingMessage={t('payments.loadingPayments')}
            entityName="payments"
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </main>
  );
}

export default Payments;
