// src/component/listTab/contracts/index.jsx
import { useState, useContext, useMemo, useCallback } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import AuthContext from "../../../context/AuthContext";
import GenericList from "../../ui/GenericList";
import SearchFilterBar from "../../ui/SearchFilterBar";
import ContractItem from "../../contracts/ContractItem";

/**
 * Contracts page using GenericList and SearchFilterBar
 */
function Contracts() {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Status filter options
  const statusOptions = useMemo(
    () => [
      { value: "", label: "Todos los Estados" },
      { value: "pending", label: "Pendiente" },
      { value: "submitted", label: "Enviado" },
      { value: "approved", label: "Aprobado" },
      { value: "rejected", label: "Rechazado" },
      { value: "cancelled", label: "Cancelado" },
      { value: "closed", label: "Cerrado" },
    ],
    []
  );

  // Table columns with sort keys (Lote first, then Cliente)
  const columns = useMemo(
    () => [
      { label: "Lote", align: "left", sortKey: "lot_id", defaultSortDirection: "asc" },
      { label: "Cliente", align: "left", sortKey: "applicant_user_id", defaultSortDirection: "asc" },
      { label: "Financiamiento", align: "center", sortKey: "financing_type", defaultSortDirection: "asc" },
      { label: "Estado", align: "center", sortKey: "status", defaultSortDirection: "asc" },
      { label: "Creado", align: "center", sortKey: "contracts.created_at", defaultSortDirection: "desc" },
      { label: "Creado Por", align: "center" },
      { label: "Acciones", align: "center" },
    ],
    []
  );

  // Filters for GenericList
  const filters = useMemo(
    () => ({
      search_term: searchTerm,
      status: statusFilter.toLowerCase(),
    }),
    [searchTerm, statusFilter]
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

  return (
    <div className="w-full rounded-lg bg-white px-6 py-6 dark:bg-darkblack-600">
      <div className="flex flex-col space-y-5">
        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchTerm={searchTerm}
          filterValue={statusFilter}
          filterOptions={statusOptions}
          onSearchChange={setSearchTerm}
          onFilterChange={setStatusFilter}
          searchPlaceholder="Buscar por cliente, lote, proyecto..."
          filterPlaceholder="Filtrar por estado"
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
          emptyMessage="No se encontraron contratos"
          loadingMessage="Cargando contratos..."
          entityName="contracts"
          showMobileCards={true}
          showDesktopTable={true}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
}

export default Contracts;