// src/components/listTab/audits/AuditLogs.jsx

import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { getToken } from "../../../../auth";
import { API_URL } from "../../../../config";
import { useParams } from "react-router-dom";

import AuditTab from "./AuditTab";
import Search from "../../forms/Search";
import Filter from "../../forms/Filter";
import Pagination from "../../Pagination";
import AuthContext from "../../../context/AuthContext";
import useDebounce from "../../../utils/useDebounce";

/**
 * The parent container that:
 * 1) Handles fetching the audit logs data from the backend
 * 2) Manages pagination (currentPage, totalPages, pageSize, etc.)
 * 3) Manages sorting
 * 4) Renders <Search>, <Filter>, <AuditTab>, and <Pagination>
 */
function AuditLogs() {
  const { user } = useContext(AuthContext);
  const token = getToken();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce

  // Audit logs data state
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortParam, setSortParam] = useState(null); // e.g., 'created_at-asc'

  // Filter state
  const [filters, setFilters] = useState({
    event: "",
    model: "",
    // Add more filter fields as needed
  });

  /**
   * Reset to first page when search term or filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters]);

  /**
   * Fetch audit logs data from the backend API
   * This effect runs when token, debouncedSearchTerm, currentPage, pageSize, sortParam, or filters change
   */
  useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      setError(null);

      // Construct query parameters
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search_term", debouncedSearchTerm);
      if (filters.event) params.append("event", filters.event);
      if (filters.model) params.append("model", filters.model);
      params.append("page", currentPage);
      params.append("per_page", pageSize);
      if (sortParam) params.append("sort", sortParam); // Include sort parameter if present

      try {
        const response = await fetch(`${API_URL}/api/v1/audits?${params.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error fetching audit logs");
        }

        const data = await response.json();
        setAudits(data.audits || []);

        // Update pagination metadata
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, [token, debouncedSearchTerm, currentPage, pageSize, sortParam, filters]);

  /**
   * Function to refresh audit logs data with new parameters
   * Accepts an object with optional sort parameter
   * @param {object} params - Parameters to update (e.g., { sort: 'created_at-asc' })
   */
  const refreshAudits = ({ sort }) => {
    if (sort !== undefined) {
      setSortParam(sort);
    }
    setCurrentPage(1); // Reset to first page on new sort
  };

  // Event Handlers

  /**
   * Handle search input changes
   * @param {string} term - The search term entered by the user
   */
  const handleSearch = (term) => setSearchTerm(term);

  /**
   * Handle filter changes
   * @param {string} value - The selected filter value
   * @param {string} field - The filter field name
   */
  const handleFilter = (value, field) => {
    setFilters({
      ...filters,
      [field]: value,
    });
    setCurrentPage(1); // Reset to first page on filter change
  };

  /**
   * Handle changes to the page size
   * @param {number} size - The new page size selected by the user
   */
  const handleSetPageSize = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  /**
   * Navigate to the previous page
   */
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  /**
   * Navigate to the next page
   */
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  /**
   * Navigate to a specific page
   * @param {number} page - The page number to navigate to
   */
  const handlePageClick = (page) => setCurrentPage(page);

  /**
   * Handle sorting when a column header is clicked
   * @param {string} field - The field to sort by
   */
  const handleSort = (field) => {
    let direction = "asc";

    if (sortParam === `${field}-asc`) {
      direction = "desc";
    }
    setSortParam(`${field}-${direction}`);
    setCurrentPage(1); // Reset to first page on new sort
  };

  // Conditional Rendering for Loading and Error States
  if (loading) return <div className="loader">Loading audit logs...</div>;
  if (error)
    return (
      <div
        className="error-container flex flex-col items-center justify-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="w-full rounded-lg bg-white px-6 py-6 dark:bg-darkblack-600">
      <div className="flex flex-col space-y-5">
        {/* Search and Filter bar */}
        <div className="flex h-[56px] w-full space-x-4">
          <Search onSearch={handleSearch} initialValue={searchTerm} />
          <Filter
            options={["Contract", "Lot", "User", "Project"]}
            onFilterChange={(value) => handleFilter(value, "model")}
          />
          {/* Add more Filter components as needed */}
        </div>

        {/* The table of audit logs, purely presentational */}
        <AuditTab
          audits={audits}
          pageSize={pageSize}
          userRole={user?.role}
          refreshAudits={refreshAudits}
          handleSort={handleSort}
          currentSort={sortParam}
        />

        {/* Pagination controls if multiple pages */}
        {totalPages > 1 && (
          <Pagination
            pageSize={pageSize}
            onSizeChange={handleSetPageSize}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
            onPageClick={handlePageClick}
          />
        )}

        {audits.length === 0 && !loading && (
          <div className="text-center text-bgray-600 dark:text-bgray-50">
            No audit logs found for the search term "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}

AuditLogs.propTypes = {
  pageSize: PropTypes.number,
};

export default AuditLogs;