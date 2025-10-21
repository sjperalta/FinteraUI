import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../contexts/LocaleContext";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";

const parseSortString = (value) => {
  if (!value || typeof value !== "string") {
    return { field: null, direction: "desc" };
  }

  const [field, direction] = value.split("-");
  if (!field) {
    return { field: null, direction: "desc" };
  }

  const normalizedDirection = direction === "asc" ? "asc" : "desc";
  return { field, direction: normalizedDirection };
};

/**
 * Generic List Component
 * A reusable component for displaying paginated lists with search and filter capabilities
 */
function GenericList({
  endpoint,
  renderItem,
  filters = {},
  onItemSelect,
  columns = [],
  sortBy = "created_at-desc",
  itemsPerPage = 5,
  emptyMessage,
  loadingMessage,
  entityName = "items",
  showMobileCards = true,
  showDesktopTable = true,
  customParams,
  refreshTrigger = 0,
  onSortChange,
}) {
  const { t } = useLocale();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting state
  const initialSort = useMemo(() => parseSortString(sortBy), [sortBy]);
  const [sortField, setSortField] = useState(initialSort.field);
  const [sortDirection, setSortDirection] = useState(initialSort.direction);

  const token = getToken();

  const handleItemClick = (item) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  const stableCustomParams = useMemo(() => customParams || {}, [customParams]);
  // Create a stable, serialised signature for filters so we can reliably
  // detect changes (object identity can cause unnecessary or out-of-order fetches).
  const filtersSignature = useMemo(() => {
    if (!filters) return "";
    const keys = Object.keys(filters).sort();
    return keys.map((k) => `${k}=${String(filters[k] ?? "")}`).join("&");
  }, [filters]);
  
  const sortParam = useMemo(() => {
    if (sortField) {
      return `${sortField}-${sortDirection}`;
    }
    return sortBy || "created_at-desc";
  }, [sortField, sortDirection, sortBy]);

  useEffect(() => {
    const parsed = parseSortString(sortBy);
    setSortField((prev) => (prev === parsed.field ? prev : parsed.field));
    setSortDirection((prev) => (prev === parsed.direction ? prev : parsed.direction));
  }, [sortBy]);

  const handleSort = useCallback(
    (column) => {
      if (!column.sortKey) {
        return;
      }

      // Calculate new sort state
      const isSameField = sortField === column.sortKey;
      const nextDirection = isSameField
        ? sortDirection === "asc" ? "desc" : "asc"
        : column.defaultSortDirection === "asc" ? "asc" : "desc";
      
      // Update state
      setCurrentPage(1);
      setSortField(column.sortKey);
      setSortDirection(nextDirection);

      // Call the optional callback
      if (typeof onSortChange === "function") {
        onSortChange(`${column.sortKey}-${nextDirection}`, column.sortKey, nextDirection);
      }
    },
    [sortField, sortDirection, onSortChange]
  );

  // Reset to page 1 if filters change (use signature to ensure stable detection)
  useEffect(() => {
    setCurrentPage(1);
  }, [filtersSignature]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      
      // Add filters (only append keys that have a value)
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      // Add custom params
      Object.entries(stableCustomParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      // Add sort parameter
      if (sortParam) {
        params.append("sort", sortParam);
      }

      // Pagination params
      params.append("page", currentPage);
      params.append("per_page", itemsPerPage);

      try {
        const response = await fetch(
          `${API_URL}${endpoint}?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching ${entityName}`);
        }

        const data = await response.json();

        // Handle different response structures
        const itemsArray = data[entityName] || data.items || data.data || data;
        setItems(Array.isArray(itemsArray) ? itemsArray : []);

        // Handle pagination metadata
        if (data.pagination) {
          setCurrentPage(data.pagination.page);
          setTotalPages(data.pagination.pages);
        } else {
          setTotalPages(1);
        }
      } catch (err) {
        console.error(`Error fetching ${entityName}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [token, filtersSignature, sortParam, currentPage, itemsPerPage, endpoint, entityName, stableCustomParams, refreshTrigger]);

  // Handle going to next or previous pages
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          {loadingMessage || t('common.loading')}
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-700 dark:text-red-300">
            {t('common.error')}: {error}
          </span>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {emptyMessage || t('common.noItemsFound')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t('common.tryAdjustingFilters')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile: Card View */}
      {showMobileCards && (
        <div className="block lg:hidden space-y-3 sm:space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 p-4 shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer"
            >
              {renderItem(item, index, true, handleItemClick)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop: Table View */}
      {showDesktopTable && (
        <div className="hidden lg:block w-full overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-darkblack-400 shadow-lg">
          <table className="w-full table-auto border-collapse bg-white dark:bg-darkblack-600 min-w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-darkblack-500 dark:to-darkblack-400 border-b-2 border-blue-200 dark:border-blue-800/50">
              <tr>
                {columns.map((column, idx) => {
                  const isSortable = Boolean(column.sortKey);
                  const isActive = isSortable && column.sortKey === sortField;
                  const ariaSort = isSortable
                    ? isActive
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined;

                  return (
                  <th
                    key={idx}
                      aria-sort={ariaSort}
                    className={`px-4 xl:px-5 py-2.5 xl:py-3 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                      {isSortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column)}
                          className={`inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                            column.align === "right" ? "justify-end w-full" : ""
                          }`}
                        >
                          <span>{column.label}</span>
                          <span
                            className={`relative flex items-center justify-center w-4 h-4 text-[0px] ${
                              isActive ? "opacity-100" : "opacity-60"
                            }`}
                            aria-hidden="true"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isActive && sortDirection === "asc" ? "transform rotate-180" : ""
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 4L19 11H5L12 4Z"
                                fill="currentColor"
                                opacity="0.7"
                              />
                              <path
                                d="M12 20L5 13H19L12 20Z"
                                fill="currentColor"
                                opacity="0.7"
                              />
                            </svg>
                          </span>
                        </button>
                      ) : (
                        column.label
                      )}
                  </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`${
                    index % 2 === 0
                      ? "bg-white dark:bg-darkblack-600"
                      : "bg-gray-50 dark:bg-darkblack-500"
                  } hover:bg-blue-50 dark:hover:bg-darkblack-400 transition-colors duration-150 cursor-pointer border-b border-gray-100 dark:border-darkblack-400`}
                >
                  {renderItem(item, index, false, handleItemClick)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls - Mobile Optimized */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 shadow-sm">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-darkblack-500 dark:to-darkblack-400 text-gray-700 dark:text-gray-300 border-2 border-blue-200 dark:border-blue-800/50 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-darkblack-400 dark:hover:to-darkblack-300 disabled:from-gray-50 disabled:to-gray-100 dark:disabled:from-darkblack-500 dark:disabled:to-darkblack-500 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed disabled:border-gray-200 dark:disabled:border-darkblack-400 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">{t('common.previous')}</span>
          </button>

          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-darkblack-500 dark:to-darkblack-400 px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-800/50 shadow-sm">
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('common.page')}
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md font-bold text-sm shadow-md">
              {currentPage}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('common.of')}
            </span>
            <span className="px-3 py-1 bg-white dark:bg-darkblack-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-darkblack-300 rounded-md font-bold text-sm">
              {totalPages}
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-darkblack-500 dark:to-darkblack-400 text-gray-700 dark:text-gray-300 border-2 border-blue-200 dark:border-blue-800/50 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-darkblack-400 dark:hover:to-darkblack-300 disabled:from-gray-50 disabled:to-gray-100 dark:disabled:from-darkblack-500 dark:disabled:to-darkblack-500 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed disabled:border-gray-200 dark:disabled:border-darkblack-400 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
          >
            <span className="font-semibold">{t('common.next')}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

GenericList.propTypes = {
  endpoint: PropTypes.string.isRequired,
  renderItem: PropTypes.func.isRequired,
  filters: PropTypes.object,
  onItemSelect: PropTypes.func,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
      sortKey: PropTypes.string,
      defaultSortDirection: PropTypes.oneOf(["asc", "desc"]),
    })
  ),
  sortBy: PropTypes.string,
  itemsPerPage: PropTypes.number,
  emptyMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  entityName: PropTypes.string,
  showMobileCards: PropTypes.bool,
  showDesktopTable: PropTypes.bool,
  customParams: PropTypes.object,
  refreshTrigger: PropTypes.number,
  onSortChange: PropTypes.func,
};

export default GenericList;
