import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";

const truncateText = (text, maxLength) => {
  if (typeof text !== "string") return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

function Project({ project, user, onDeleted }) {
  const {
    id,
    available,
    name,
    project_type,
    total_lots,
    total_area,
    price_per_square_unit,
    measurement_unit,
  } = project;

  const unitLabel = (u) => {
    switch ((u || "").toLowerCase()) {
      case "m2": return "m²";
      case "ft2": return "ft²";
      case "vara2": return "v²";
      default: return "m²";
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar proyecto "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/v1/projects/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error eliminando el proyecto");
      }

      alert("Proyecto eliminado correctamente");
      if (typeof onDeleted === "function") {
        onDeleted();
      }
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
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
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm font-medium text-red-500"
            >
              Eliminar
            </button>
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
    measurement_unit: PropTypes.string,
  }).isRequired,
  onDeleted: PropTypes.func, // optional callback to refresh parent list
};

export default Project;