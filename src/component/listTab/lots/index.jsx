// src/component/listTab/lots/index.jsx
import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useParams, useLocation } from "react-router-dom";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";

import LotTab from "./LotTab";
import LotFilter from "../../forms/LotFilter";
import Pagination from "../../Pagination";
import AuthContext from "../../../context/AuthContext";
import useDebounce from "../../../utils/useDebounce";

/**
 * The parent container that:
 * 1) Handles fetching the lots data from the backend
 * 2) Manages pagination (currentPage, totalPages, pageSize, etc.)
 * 3) Manages sorting
 * 4) Renders <Search>, <LotTab>, and <Pagination>
 */
function Lots() {
  const { user } = useContext(AuthContext);
  const token = getToken();
  const { id } = useParams(); // e.g., /projects/:id/lots
  const location = useLocation();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce

  // Filter state
  const [status, setStatus] = useState("");
  
  // Highlighted lot state for navigation from contracts
  const [highlightedLotId, setHighlightedLotId] = useState(null);

  // Lots data state
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortParam, setSortParam] = useState('updated_at-asc'); // e.g., 'name' or 'name-asc'

  /**
   * Handle navigation from contracts page - auto-search for the specific lot
   */
  useEffect(() => {
    if (location.state?.selectedLotId || location.state?.selectedLotName) {
      // Set the search term to the lot name to help find it in the list
      if (location.state.selectedLotName) {
        setSearchTerm(location.state.selectedLotName);
      }
      
      // Set the highlighted lot ID to visually distinguish it
      if (location.state.selectedLotId) {
        setHighlightedLotId(location.state.selectedLotId);
        
        // Clear the highlighting after 5 seconds
        setTimeout(() => {
          setHighlightedLotId(null);
        }, 5000);
      }
      
      // Clear the navigation state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  /**
   * Reset to first page when search term or status changes
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, status]);

  /**
   * Fetch lots data from the backend API
   * This effect runs when token, debouncedSearchTerm, status, currentPage, pageSize, sortParam, or id changes
   */
  useEffect(() => {
    const fetchLots = async () => {
      setLoading(true);
      setError(null);

      // Construct query parameters
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search_term", debouncedSearchTerm);
      if (status) params.append("status", status.toLowerCase());
      params.append("page", currentPage);
      params.append("per_page", pageSize);
      if (sortParam) params.append("sort", sortParam); // Include sort parameter if present

      console.log("Fetching lots with params:", params.toString());
      try {
        const response = await fetch(
          `${API_URL}/api/v1/projects/${id}/lots?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error fetching lots");
        }

        const data = await response.json();
        setLots(data.lots || []);

        // Update pagination metadata
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [token, debouncedSearchTerm, status, currentPage, pageSize, sortParam, id]);

  /**
   * Function to refresh lots data with new parameters
   * Accepts an object with optional sort parameter
   * @param {object} params - Parameters to update (e.g., { sort: 'name' })
   */
  const refreshLots = ({ sort } = {}) => {
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
   * Handle status filter changes
   * @param {string} statusValue - The status selected by the user
   */
  const handleStatusChange = (statusValue) => setStatus(statusValue);

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
  const handlePrevPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  /**
   * Navigate to the next page
   */
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  /**
   * Navigate to a specific page
   * @param {number} page - The page number to navigate to
   */
  const handlePageClick = (page) => setCurrentPage(page);

  // Conditional Rendering for Loading and Error States
  if (loading) return <div className="loader">Cargando lotes...</div>;
  if (error) return (
    <div className="error-container flex flex-col items-center justify-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {error}</span>
      <button
        onClick={() => fetchLots()}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
      >
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="w-full rounded-lg bg-white px-6 py-6 dark:bg-darkblack-600">
      <div className="flex flex-col space-y-5">
        {/* Filter bar */}
        <LotFilter
          searchTerm={searchTerm}
          status={status}
          onSearchChange={handleSearch}
          onStatusChange={handleStatusChange}
        />

        {/* The table of lots, purely presentational */}
        <LotTab
          lots={lots}
          pageSize={pageSize}
          userRole={user?.role}
          refreshLots={refreshLots}
          highlightedLotId={highlightedLotId}
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

      {lots.length === 0 && !loading && (
        <div className="text-center text-bgray-600 dark:text-bgray-50">
          No se encontraron lotes{searchTerm && ` con el término de búsqueda "${searchTerm}"`}{status && ` con estado "${status}"`}.
        </div>
      )}
      </div>
    </div>
  );
}

Lots.propTypes = {
  pageSize: PropTypes.number,
};

export default Lots;