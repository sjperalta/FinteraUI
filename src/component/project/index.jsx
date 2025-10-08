import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { useLocale } from "../../contexts/LocaleContext";

const truncateText = (text, maxLength) => {
  if (typeof text !== "string") return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

function Project({ project, user, onDeleted }) {
  const { t } = useLocale();
  const {
    id,
    available,
    name,
    project_type,
    total_lots,
    total_area,
    price_per_square_unit,
    measurement_unit
  } = project;

  const unitLabel = (u) => {
    switch ((u || "").toLowerCase()) {
      case "m2": return t('projects.squareMeters');
      case "ft2": return t('projects.squareFeet');
      case "vara2": return t('projects.squareVaras');
      default: return t('projects.squareMeters');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('projects.confirmDelete', { name }))) return;
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
        throw new Error(err.error || t('projects.deleteError'));
      }

      alert(t('projects.deleteSuccess'));
      if (typeof onDeleted === "function") {
        onDeleted();
      }
    } catch (err) {
      console.error(err);
      alert(`${t('common.error')}: ${err.message}`);
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
        {t('projects.projectDescription', {
          name,
          total_area,
          unit: unitLabel(measurement_unit),
          available,
          total_lots,
          price_per_square_unit,
          currency: 'HNL'
        })}
      </p>

      {/* Action Links */}
      <div className="flex items-center gap-5">
        <Link
          to={`/projects/${id}/lots`}
          className="bg-success-300 hover:bg-success-400 text-white text-sm font-medium px-3 py-1 rounded"
          aria-label={t('projects.viewLots', { name })}
        >
          {t('projects.lots')} ({total_lots})
        </Link>
        {/* Only render Editar and Eliminar if user is admin */}
        {user && user.role === "admin" && (
          <>
            <Link
              to={`/projects/${id}/edit`}
              className="text-sm font-medium text-success-300"
            >
              {t('projects.editLink')}
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm font-medium text-red-500"
            >
              {t('projects.delete')}
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