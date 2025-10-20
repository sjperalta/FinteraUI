// src/pages/audits/index.jsx

import { useState, useContext } from "react";
import PropTypes from "prop-types";
import AuthContext from "../../context/AuthContext";

import GenericList from "../../component/ui/GenericList";
import SearchFilterBar from "../../component/ui/SearchFilterBar";

import AuditInfo from "../../component/audit/AuditInfo";
import { useLocale } from "../../contexts/LocaleContext";

/**
 * Audits page component that displays audit logs using GenericList
 */
function Audits() {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState({
    model: "",
  });

  // Sorting state - default to created_at descending
  const [sortBy, setSortBy] = useState("created_at-desc");

  // Filter options for SearchFilterBar
  const modelFilterOptions = [
    { value: "", label: t("audits.filterByModel") },
    { value: "Contract", label: "Contract" },
    { value: "Lot", label: "Lot" },
    { value: "User", label: "User" },
    { value: "Project", label: "Project" },
  ];

  // Table columns for GenericList
  const columns = [
    { label: t("audits.table.event"), align: "left" },
    { label: t("audits.table.model"), align: "left" },
    { label: t("audits.table.itemId"), align: "left" },
    { label: t("audits.table.user"), align: "left" },
    { label: t("audits.table.changes"), align: "left" },
    { label: t("audits.table.date"), align: "left" },
    { label: t("audits.table.ipAddress"), align: "left" },
    { label: t("audits.table.userAgent"), align: "left" },
  ];

  // Render function for GenericList
  const renderAuditItem = (audit, index, isMobileCard, handleClick) => {
    return (
      <AuditInfo
        audit={audit}
        index={index}
        isMobileCard={isMobileCard}
        onClick={handleClick}
        userRole={user?.role}
      />
    );
  };

  // Event Handlers

  /**
   * Handle search input changes
   * @param {string} term - The search term entered by the user
   */
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  /**
   * Handle filter changes
   * @param {string} value - The selected filter value
   */
  const handleFilter = (value) => {
    setFilterState({
      ...filterState,
      model: value,
    });
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700">
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-10">
        <div className="2xl:flex-1 w-full">
          {/* Search and Filter bar */}
          <SearchFilterBar
            searchTerm={searchTerm}
            filterValue={filterState.model}
            filterOptions={modelFilterOptions}
            onSearchChange={handleSearch}
            onFilterChange={handleFilter}
            searchPlaceholder={t("audits.searchPlaceholder")}
            filterPlaceholder={t("audits.filterByModel")}
            showFilter={true}
          />

          {/* Audit logs list */}
          <GenericList
            endpoint="/api/v1/audits"
            renderItem={renderAuditItem}
            filters={{
              search_term: searchTerm,
              model: filterState.model,
            }}
            onItemSelect={(audit) => {
              // Handle audit item selection if needed
              console.log("Selected audit:", audit);
            }}
            columns={columns}
            sortBy={sortBy}
            itemsPerPage={20}
            emptyMessage={t("audits.noAuditsFound")}
            loadingMessage={t("audits.loading")}
            entityName="audits"
          />
        </div>
      </div>
    </main>
  );
}

Audits.propTypes = {
  pageSize: PropTypes.number,
};

export default Audits;
