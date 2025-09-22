import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const truncateText = (text, maxLength) => {
  if (typeof text !== "string") return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

function Project({ project, user }) {
  const {
    id,
    available,
    name,
    project_type,
    total_lots,
    total_area,
    price_per_square_unit,          // renamed
    measurement_unit,               // new (may come from API if added there)
  } = project;

  const unitLabel = (u) => {
    switch ((u || "").toLowerCase()) {
      case "m2": return "m²";
      case "ft2": return "ft²";
      case "vara2": return "v²";
      default: return "m²";
    }
  };

  return (
    <div className="bg-white dark:bg-darkblack-600 rounded-lg p-6 relative">

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
        {name} tiene un área total de {total_area} {unitLabel(measurement_unit)}, posee {available}/
        {total_lots} lotes disponibles, con un precio por {unitLabel(measurement_unit)} de{" "}
        {price_per_square_unit} LPS.
      </p>

      {/* Action Links */}
      <div className="flex items-center gap-5">
        <Link
          to={`/projects/${id}/lots`}
          className="bg-success-300 hover:bg-success-400 text-white text-sm font-medium px-3 py-1 rounded"
          aria-label={`Ver lotes del proyecto ${name}`}
        >
          Lotes ({total_lots})
        </Link>
        {/* Only render Editar and Eliminar if user is admin */}
        {user && user.role === "admin" && (
          <>
            <Link
              to={`/projects/${id}/edit`}
              className="text-sm font-medium text-success-300"
            >
              Editar
            </Link>
            <Link
              to={`/projects/${id}/delete`}
              className="text-sm font-medium text-success-300"
            >
              Eliminar
            </Link>
          </>
        )}
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
    total_area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    price_per_square_unit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    measurement_unit: PropTypes.string, // optional
  }).isRequired,
};

export default Project;