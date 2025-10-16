import { useState, useEffect, useContext } from "react";
import UserData from "./UserData";
import AuthContext from "../../context/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { API_URL } from "./../../../config";

function UsersList({ searchTerm, role, onUserSelect }) {
  const { t } = useLocale();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5); // Number of users per page; adjust as needed
  const [totalPages, setTotalPages] = useState(1);

  const { token } = useContext(AuthContext);

  const handleUserClick = (user) => {
    onUserSelect(user);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("search_term", searchTerm);
      if (role) params.append("role", role);

      // Add sort parameter
      params.append("sort", "created_at-desc");

      // Pagination params
      params.append("page", currentPage);
      params.append("per_page", perPage);

      try {
        const response = await fetch(
          `${API_URL}/api/v1/users?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error fetching users");
        }

        // We expect { users: [...], pagination: { page, items, count, pages } }
        const data = await response.json();

        // The array of users
        if (data.users) {
          setUsers(data.users);
        } else {
          // Fallback if the backend didn't wrap in {users:..., pagination:...}
          setUsers(data);
        }

        // If pagination metadata is present, store it
        if (data.pagination) {
          setCurrentPage(data.pagination.page);
          setTotalPages(data.pagination.pages);
        } else {
          // fallback if no pagination metadata returned
          setTotalPages(1);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, searchTerm, role, currentPage, perPage]);

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

  // Reset to page 1 if searchTerm or role change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, role]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          {t('users.loadingUsers')}
        </span>
      </div>
    );
  }

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
          <span className="text-red-700 dark:text-red-300">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile: Card View */}
      <div className="block lg:hidden space-y-3 sm:space-y-4">
        {users?.map((user, index) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 p-4 shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer"
          >
            <UserData
              userInfo={user}
              index={index}
              token={token}
              onClick={() => handleUserClick(user)}
              isMobileCard={true}
            />
          </div>
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-darkblack-400 shadow-lg">
        <table className="w-full table-auto border-collapse bg-white dark:bg-darkblack-600 min-w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-darkblack-500 dark:to-darkblack-400 border-b-2 border-blue-200 dark:border-blue-800/50">
            <tr>
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {t('users.user')}
              </th>
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {t('common.status')}
              </th>
              <th className="px-4 xl:px-5 py-2.5 xl:py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user, index) => (
              <UserData
                key={user.id}
                userInfo={user}
                index={index}
                token={token}
                onClick={() => handleUserClick(user)}
                isMobileCard={false}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Mobile Optimized */}
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
    </div>
  );
}

export default UsersList;
