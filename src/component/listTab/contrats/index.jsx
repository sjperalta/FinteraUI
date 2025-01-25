// src/component/listTab/contracts/index.jsx
import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";

import ContractTab from "./ContractTab";
import Search from "../../forms/Search";
import Pagination from "../../Pagination";
import AuthContext from "../../../context/AuthContext";
import useDebounce from "../../../utils/useDebounce";
import Filter from "../../forms/Filter";

/**
 * The parent container that:
 * 1) Handles fetching the contracts data from the backend
 * 2) Manages pagination (currentPage, totalPages, pageSize, etc.)
 * 3) Manages sorting
 * 4) Renders <Search>, <ContractTab>, and <Pagination>
 */
function Contracts() {
  const { user } = useContext(AuthContext);
  const token = getToken();
  const { id, lot_id } = useParams(); // e.g., /projects/:id/lots/:lot_id/contracts

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce

  // Contracts data state
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortParam, setSortParam] = useState(null); // e.g., 'customer_name' or '-balance'

  /**
   * Reset to first page when search term changes
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  /**
   * Fetch contracts data from the backend API
   * This effect runs when token, debouncedSearchTerm, currentPage, pageSize, sortParam, or id changes
   */
  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      setError(null);

      // Construct query parameters
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search_term", debouncedSearchTerm);
      params.append("page", currentPage);
      params.append("per_page", pageSize);
      if (sortParam) params.append("sort", sortParam); // Include sort parameter if present

      try {
        const response = await fetch(
          `${API_URL}/api/v1/contracts?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error fetching contracts");
        }

        const data = await response.json();
        setContracts(data.contracts || []);

        // Update pagination metadata
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [token, debouncedSearchTerm, currentPage, pageSize, sortParam, id, lot_id]);

  /**
   * Function to refresh contracts data with new parameters
   * Accepts an object with optional sort parameter
   * @param {object} params - Parameters to update (e.g., { sort: 'customer_name' })
   */
  const refreshContracts = ({ sort }) => {
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

  // Conditional Rendering for Loading and Error States
  if (loading) return <div className="loader">Cargando contratos...</div>;
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
          Reintentar
        </button>
      </div>
    );

  return (
    <div className="w-full rounded-lg bg-white px-6 py-6 dark:bg-darkblack-600">
      <div className="flex flex-col space-y-5">
        {/* Search bar */}
        <div className="flex h-[56px] w-full space-x-4">
          <Search onSearch={handleSearch} initialValue={searchTerm} />
          <Filter options={["Directo", "Banco", "Contado"]} />
        </div>

        {/* The table of contracts, purely presentational */}
        <ContractTab
          contracts={contracts}
          pageSize={pageSize}
          userRole={user?.role}
          refreshContracts={refreshContracts}
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

        {contracts.length === 0 && !loading && (
          <div className="text-center text-bgray-600 dark:text-bgray-50">
            No se encontraron contratos con el término de búsqueda "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}

Contracts.propTypes = {
  pageSize: PropTypes.number,
};

export default Contracts;