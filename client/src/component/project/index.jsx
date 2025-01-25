import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const truncateText = (text, maxLength) => {
  if (typeof text !== "string") return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

function Project({ project }) {
  const {
    id,
    available,
    name,
    project_type,
    total_lots,
    total_area,
    price_per_square_foot,
  } = project;

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const toggleOptions = () => {
    setIsOptionsOpen((prev) => !prev);
  };

  return (
    <div className="bg-white dark:bg-darkblack-600 rounded-lg p-6 relative">
      {/* Options Button */}
      <button
        className="absolute right-6 top-6 focus:outline-none"
        aria-label="Opciones del proyecto"
        onClick={toggleOptions}
      >
        <svg
          width="24"
          height="25"
          className="stroke-bgray-50"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* SVG Paths */}
        </svg>
      </button>

      {/* Options Dropdown */}
      {isOptionsOpen && (
        <div className="absolute right-6 top-14 bg-white dark:bg-darkblack-500 border border-bgray-300 dark:border-darkblack-400 rounded-md shadow-lg z-10">
          <Link
            to={`/projects/${id}/edit`}
            className="block px-4 py-2 text-sm text-bgray-700 dark:text-white hover:bg-bgray-100 dark:hover:bg-darkblack-400"
            onClick={() => setIsOptionsOpen(false)}
          >
            Editar
          </Link>
          <Link
            to={`/projects/${id}/delete`}
            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100"
            onClick={() => setIsOptionsOpen(false)}
          >
            Eliminar
          </Link>
        </div>
      )}

      {/* Project Information */}
      <div className="flex space-x-5">
        <div className="text-3xl font-bold leading-[68px] dark:text-white text-yellow-500">
          {available}
        </div>
        <div>
          <h3 className="text-2xl text-bgray-900 dark:text-white font-bold">
            {truncateText(name, 18)}
          </h3>
          <span className="text-lg text-bgray-600 dark:text-bgray-50">
            {project_type}
          </span>
        </div>
      </div>

      {/* Project Description */}
      <p className="pt-5 pb-8 text-lg text-bgray-600 dark:text-bgray-50">
        {name} tiene un área total de {total_area} v², posee {available}/
        {total_lots} lotes disponibles, con un precio por vara de{" "}
        {price_per_square_foot} LPS.
      </p>

      {/* Action Links */}
      <div className="flex items-center gap-5">
        <Link
          to={`/projects/${id}/edit`}
          className="text-sm font-medium text-success-300"
        >
          Editar
        </Link>
        <Link
          to={`/projects/${id}/lots`}
          className="text-sm font-medium text-success-300"
        >
          Ver Lotes
        </Link>
        <Link
          to={`/projects/${id}/reports`}
          className="text-sm font-medium text-success-300"
        >
          Reportes
        </Link>
      </div>
    </div>
  );
}

Project.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    available: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    project_type: PropTypes.string.isRequired,
    total_lots: PropTypes.number.isRequired,
    total_area: PropTypes.string.isRequired,
    price_per_square_foot: PropTypes.string.isRequired,
  }).isRequired,
};

export default Project;