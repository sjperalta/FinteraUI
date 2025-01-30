import { useState, useEffect, useContext } from "react";
import UserData from "./UserData";
import AuthContext from "../../context/AuthContext";
import { API_URL } from "./../../../config";

function UsersList({ searchTerm, role, onUserSelect }) {
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

      // Pagination params
      params.append("page", currentPage);
      params.append("per_page", perPage);

      try {
        const response = await fetch(`${API_URL}/api/v1/users?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full overflow-x-scroll">
      <table className="w-full">
        <tbody>
          {users?.map((user, index) => (
            <UserData key={user.id} userInfo={user} index={index} token={token} onClick={() => handleUserClick(user)} />
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default UsersList;