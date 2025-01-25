import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Para redirigir a otra página
import Project from "../../component/project"; // Componente renombrado
import { API_URL } from './../../../config'; // Importa la URL base
import { getToken } from './../../../auth'; // Asumiendo que tienes una función para obtener el token

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook de React Router para redirigir

  // Obtén el token JWT de algún sistema de autenticación
  const token = getToken();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/projects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Incluye el token en los headers
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching projects');
        }

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleAddProject = () => {
    // Aquí puedes redirigir a la página de creación de proyectos
    navigate('/projects/create'); // Asumiendo que tienes una ruta para crear proyectos
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      {/* Botón de agregar proyecto */}
      <div className="flex justify-end mb-4">
        <button
          className="py-2 px-4 bg-success-300 text-white font-bold rounded-lg hover:bg-success-400 transition-all"
          onClick={handleAddProject}
        >
          Agregar Proyecto
        </button>
      </div>
      
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 xl:gap-6">
        {projects?.map((project) => (
          <Project key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
}

export default Projects;