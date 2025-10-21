import { useState, useContext, useMemo, useCallback } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import AuthContext from "../../context/AuthContext";
import GenericList from "../../component/ui/GenericList";
import SearchFilterBar from "../../component/ui/SearchFilterBar";
import ContractItem from "../../component/contracts/ContractItem";

function Contract() {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Status filter options
  const statusOptions = useMemo(
    () => [
      { value: "", label: t('contracts.allStatuses') },
      { value: "pending", label: t('contracts.status.pending') },
      { value: "submitted", label: t('contracts.status.submitted') },
      { value: "approved", label: t('contracts.status.approved') },
      { value: "rejected", label: t('contracts.status.rejected') },
      { value: "cancelled", label: t('contracts.status.cancelled') },
      { value: "closed", label: t('contracts.status.closed') },
    ],
    [t]
  );

  // Table columns with sort keys (Lote first, then Cliente)
  const columns = useMemo(
    () => [
      {
        label: t('contracts.lot'),
        align: "left",
        sortKey: "lot_id",
        defaultSortDirection: "asc",
      },
      {
        label: t('contracts.client'),
        align: "left",
        sortKey: "applicant_user_id",
        defaultSortDirection: "asc",
      },
      {
        label: t('contracts.financing'),
        align: "center",
        sortKey: "financing_type",
        defaultSortDirection: "asc",
      },
      {
        label: t('common.status'),
        align: "center",
        sortKey: "status",
        defaultSortDirection: "asc",
      },
      {
        label: t('contracts.created'),
        align: "center",
        sortKey: "contracts.created_at",
        defaultSortDirection: "desc",
      },
      { label: t('contracts.createdBy'), align: "center" },
      { label: t('contracts.actions'), align: "center" },
    ],
    [t]
  );
  
  // Refresh function
  const refreshContracts = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Render function for GenericList
  const renderContractItem = useCallback(
    (contract, index, isMobileCard) => {
      return (
        <ContractItem
          key={contract.id}
          contract={contract}
          userRole={user?.role}
          refreshContracts={refreshContracts}
          isMobileCard={isMobileCard}
        />
      );
    },
    [user?.role, refreshContracts]
  );

  // Build filters object - only include non-empty values
  const filters = useMemo(() => {
    const result = {};
    if (searchTerm.trim()) {
      result.search_term = searchTerm.trim();
    }
    if (statusFilter) {
      result.status = statusFilter;
    }
    return result;
  }, [searchTerm, statusFilter]);

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700">
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-10">
        <div className="2xl:flex-1 w-full">
          {/* Search and Filter Bar */}
          <SearchFilterBar
            searchTerm={searchTerm}
            filterValue={statusFilter}
            filterOptions={statusOptions}
            onSearchChange={setSearchTerm}
            onFilterChange={setStatusFilter}
            searchPlaceholder={t("contracts.searchPlaceholder")}
            filterPlaceholder={t("contracts.filterByStatus")}
            showFilter={true}
          />

          {/* Generic List */}
          <GenericList
            endpoint="/api/v1/contracts"
            renderItem={renderContractItem}
            filters={filters}
            columns={columns}
            sortBy="contracts.created_at-desc"
            itemsPerPage={20}
            emptyMessage={t("contracts.noContractsFound")}
            loadingMessage={t("contracts.loadingContracts")}
            entityName="contracts"
            showMobileCards={true}
            showDesktopTable={true}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </main>
  );
}

export default Contract;
