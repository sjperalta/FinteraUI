// src/component/listTab/payments/index.jsx
import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { API_URL } from "../../../../config";
import { getToken } from "../../../../auth";

import PaymentTab from "./PaymentTab"; // Component for rendering payments
import Search from "../../forms/Search";
import Pagination from "../../Pagination";
import AuthContext from "../../../context/AuthContext";
import useDebounce from "../../../utils/useDebounce";
import Filter from "../../forms/Filter";

/**
 * The parent container that:
 * 1) Handles fetching the payments data from the backend
 * 2) Manages pagination (currentPage, totalPages, pageSize, etc.)
 * 3) Manages sorting
 * 4) Renders <Search>, <PaymentTab>, and <Pagination>
 */
function Payments() {
  const { user } = useContext(AuthContext);
  const token = getToken();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce

  // Payments data state
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortParam, setSortParam] = useState(null); // e.g., 'due_date' or '-amount'

  /**
   * Reset to first page when search term changes
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  /**
   * Fetch payments data from the backend API
   * This effect runs when token, debouncedSearchTerm, currentPage, pageSize, or sortParam changes
   */
  useEffect(() => {
    const fetchPayments = async () => {
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
          `${API_URL}/api/v1/payments?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error fetching payments");
        }

        const data = await response.json();
        setPayments(data.payments || []);

        // Update pagination metadata
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [token, debouncedSearchTerm, currentPage, pageSize, sortParam]);

  /**
   * Refresh payments data with new parameters
   * Accepts an object with optional sort parameter
   * @param {object} params - Parameters to update (e.g., { sort: 'due_date' })
   */
  const refreshPayments = ({ sort }) => {
    if (sort !== undefined) {
      setSortParam(sort);
    }
    setCurrentPage(1); // Reset to first page on new sort
  };

  // Event Handlers

  const handleSearch = (term) => setSearchTerm(term);
  const handleSetPageSize = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageClick = (page) => setCurrentPage(page);

  // Conditional Rendering for Loading and Error States
  if (loading) return <div className="loader">Cargando pagos...</div>;
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
          <Filter options={["Pendiente", "Pagado", "Vencido"]} />
        </div>

        {/* The table of payments */}
        <PaymentTab
          payments={payments}
          pageSize={pageSize}
          userRole={user?.role}
          refreshPayments={refreshPayments}
        />

        {/* Pagination controls */}
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

        {payments.length === 0 && !loading && (
          <div className="text-center text-bgray-600 dark:text-bgray-50">
            No se encontraron pagos con el término de búsqueda "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}

Payments.propTypes = {
  pageSize: PropTypes.number,
};

export default Payments;