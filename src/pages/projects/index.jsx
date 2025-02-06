import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Project from "../../component/project"; 
import { API_URL } from "../../../config"; 
import AuthContext from "../../context/AuthContext";
import ActionBtn from "../../component/header/ActionBtn"

// Import the new reusable component
import GenericFilter from "../../component/forms/GenericFilter";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);

  // States for filtering/sorting/pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortParam, setSortParam] = useState("");  // e.g. "name-asc" or "created_at-desc"
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const navigate = useNavigate();

  // Whenever filters or pagination change, refetch
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortParam, page, perPage, token]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query params
      const url = new URL(`${API_URL}/api/v1/projects`);
      if (searchTerm) {
        url.searchParams.set("search_term", searchTerm);
      }
      if (sortParam) {
        // e.g. "name-asc", "created_at-desc"
        url.searchParams.set("sort", sortParam);
      }
      url.searchParams.set("page", page);
      url.searchParams.set("per_page", perPage);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching projects");
      }

      const data = await response.json();
      // { projects: [...], pagination: {...} }
      setProjects(data.projects || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Callback when user picks search text (≥ 3 chars)
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  // Callback when user picks a sort from the dropdown
  const handleSortChange = (selected) => {
    // "No Sort" => ""
    setSortParam(selected);
    setPage(1);
  };

  // For creating new projects
  const handleAddProject = () => {
    navigate("/projects/create");
  };

  // Pagination
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (pagination.pages && page < pagination.pages) {
      setPage(page + 1);
    }
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      
      {/* 
        GenericFilter handles:
          - Debounced search input
          - A dropdown for sorting
      */}
      <GenericFilter
        searchTerm={searchTerm}
        filterValue={sortParam}
        filterOptions={[
          "No Sort",
          "name-asc",
          "name-desc",
          "created_at-desc",
          "created_at-asc"
        ]}
        onSearchChange={handleSearchChange}
        onFilterChange={handleSortChange}
        searchPlaceholder="Buscar Proyectos..."
        filterPlaceholder="Ordenar..."
        minSearchLength={3}
      />

      <div className="px-4 py-4 flex items-center">
        { user?.role === "admin" ? <ActionBtn  
          name="create_project"
          clickHandler={handleAddProject}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          } />
          : null}
      </div>

      {/* Projects Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 xl:gap-6">
        {projects.map((project) => (
          <Project key={project.id} project={project} user={user} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.pages && pagination.pages > 1 && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page >= pagination.pages}
            className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}

export default Projects;