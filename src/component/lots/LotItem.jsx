import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import { getStatusLabel, getStatusBadgeClass } from "../../utils/statusUtils";

/**
 * LotItem Component
 * 
 * Renders a single lot in either mobile card or desktop table row format.
 * Supports dual rendering via isMobileCard prop.
 * 
 * @param {Object} lot - The lot object with all lot data
 * @param {string} userRole - Current user's role (admin, seller, etc.)
 * @param {boolean} isMobileCard - If true, renders full card; if false, returns only <td> elements
 * @param {boolean} isHighlighted - If true, applies highlighting styles (from contract navigation)
 */
function LotItem({ lot, userRole, isMobileCard = false, isHighlighted = false }) {
  const { t } = useLocale();
  const {
    id,
    project_id,
    project_name,
    name,
    address,
    registration_number,
    dimensions,
    measurement_unit,
    area,
    override_area,
    price,
    override_price,
    balance,
    reserved_by,
    reserved_by_user_id,
    contract_created_by,
    contract_created_user_id,
    status,
    contract_id,
  } = lot;

  console.log(lot);

  // Get status label and badge class using centralized utilities
  const statusLabel = getStatusLabel(status);
  const badgeClass = getStatusBadgeClass(status);

  // Calculate effective price (override takes precedence)
  const effectivePrice = override_price && override_price > 0 ? override_price : price;
  const hasPriceOverride = override_price && override_price > 0;
  const savings = hasPriceOverride ? Number(price - override_price) : 0;

  // Check if area is overridden
  const hasAreaOverride = override_area && override_area > 0;

  // Format price with thousands separator
  const formatPrice = (value) => {
    if (!value) return "N/A";
    return `${Number(value).toLocaleString()} HNL`;
  };

  // Render dimensions with measurement unit
  const renderDimensions = () => {
    return (
      <div className="space-y-2">
        <p className="text-base font-medium text-bgray-900 dark:text-white">
          {dimensions}{measurement_unit ? ` (${measurement_unit})` : ""}
        </p>
        {area !== undefined && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {hasAreaOverride && (
                <svg className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
              <p className={`text-xs font-medium ${hasAreaOverride ? 'text-yellow-600 dark:text-yellow-400' : 'text-bgray-600 dark:text-bgray-400'}`}>
                {t("lots.area")}: {area} {measurement_unit || "m²"}
              </p>
            </div>
            {hasAreaOverride && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 dark:from-yellow-900/50 dark:to-yellow-800/30 dark:text-yellow-300 rounded-full border border-yellow-200 dark:border-yellow-700/50 shadow-sm">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                {t("lots.overridden")}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render price with override handling
  const renderPrice = () => {
    if (hasPriceOverride) {
      return (
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <p className="text-base font-semibold text-green-600 dark:text-green-400">
                {formatPrice(override_price)}
              </p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-50 text-green-700 dark:from-green-900/50 dark:to-emerald-800/30 dark:text-green-300 rounded-full border border-green-200 dark:border-green-700/50 shadow-sm">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              {t("lots.specialPrice")}
            </span>
          </div>
          <p className="text-sm text-bgray-500 dark:text-bgray-400 line-through">
            {t("lots.originalPrice")}: {formatPrice(price)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {t("lots.savings")}: {formatPrice(savings)}
          </p>
        </div>
      );
    }
    return (
      <p className="text-base font-semibold text-bgray-900 dark:text-white">
        {formatPrice(price || balance)}
      </p>
    );
  };

  // Render reserved by with conditional link
  const renderReservedBy = () => {
    if (!reserved_by) {
      return (
        <p className="text-base font-medium text-bgray-500 dark:text-bgray-400 italic">
          {t("lots.notReserved")}
        </p>
      );
    }

    const canViewLink = reserved_by_user_id && (
      userRole === "admin" || 
      String(contract_created_user_id) === String(reserved_by_user_id)
    );

    return (
      <div className="space-y-1">
        {canViewLink ? (
          <Link 
            to={`/financing/user/${reserved_by_user_id}`} 
            className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {reserved_by}
          </Link>
        ) : (
          <p className="text-base font-medium text-bgray-900 dark:text-white">
            {reserved_by}
          </p>
        )}
        {contract_created_by && (
          <p className="text-xs text-bgray-500 dark:text-bgray-400">
            {t("lots.reservationCreatedBy")}: {contract_created_by}
          </p>
        )}
      </div>
    );
  };

  // Render action buttons
  const renderActions = () => {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* RESERVAR link */}
        {status?.toLowerCase() === "available" && (
          <Link
            to={`/projects/${project_id}/lots/${id}/contracts/create`}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t("lots.reserve")}
          </Link>
        )}

        {/* EDITAR button for admin */}
        {userRole === "admin" && status?.toLowerCase() !== "sold" && (
          <Link
            to={`/projects/${project_id}/lots/${id}/edit`}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t("common.edit")}
          </Link>
        )}
      </div>
    );
  };

  // MOBILE CARD VIEW
  if (isMobileCard) {
    return (
      <div
        className={`bg-white dark:bg-darkblack-600 rounded-xl border-2 ${
          isHighlighted
            ? "border-blue-500 dark:border-blue-600 shadow-xl ring-2 ring-blue-200 dark:ring-blue-700"
            : "border-gray-200 dark:border-darkblack-400 shadow-md"
        } p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200`}
      >
        {/* Header: Project Name */}
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-200 dark:border-darkblack-400">
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              🏢 {project_name}
            </p>
            <h3 className="text-lg font-bold text-bgray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-xs text-bgray-500 dark:text-bgray-400 font-mono mt-1">
              ID: {id}
            </p>
          </div>
          <span className={badgeClass}>{statusLabel}</span>
        </div>

        {/* Lot Details */}
        <div className="space-y-3 mb-4">
          {/* Address and Registration */}
          {(address || registration_number) && (
            <div className="space-y-1">
              {address && (
                <p className="text-sm text-bgray-600 dark:text-bgray-300 flex items-start">
                  <span className="mr-1">📍</span>
                  {address}
                </p>
              )}
              {registration_number && (
                <p className="text-xs text-bgray-500 dark:text-bgray-400 font-mono">
                  REG: {registration_number}
                </p>
              )}
            </div>
          )}

          {/* Dimensions */}
          <div>
            <p className="text-xs text-bgray-500 dark:text-bgray-400 uppercase tracking-wide mb-1">
              {t("lotsTable.dimensions")}
            </p>
            {renderDimensions()}
          </div>

          {/* Price */}
          <div>
            <p className="text-xs text-bgray-500 dark:text-bgray-400 uppercase tracking-wide mb-1">
              {t("lotsTable.price")}
            </p>
            {renderPrice()}
          </div>

          {/* Reserved By */}
          {reserved_by && (
            <div>
              <p className="text-xs text-bgray-500 dark:text-bgray-400 uppercase tracking-wide mb-1">
                {t("lotsTable.reservedBy")}
              </p>
              {renderReservedBy()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-200 dark:border-darkblack-400">
          {renderActions()}
        </div>
      </div>
    );
  }

  // DESKTOP TABLE ROW VIEW (return only <td> elements)
  return (
    <>
      {/* Lote Info (Name, ID, Address, Registration) */}
      <td className="px-6 py-5">
        <div className="space-y-1">
          <p className="text-base font-semibold text-bgray-900 dark:text-white">
            {name}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            🏢 {project_name}
          </p>
          <p className="text-xs text-bgray-500 dark:text-bgray-400 font-mono">
            ID: {id}
          </p>
          {address && (
            <p className="text-sm text-bgray-600 dark:text-bgray-300">
              📍 {address}
            </p>
          )}
          {registration_number && (
            <p className="text-xs text-bgray-500 dark:text-bgray-400 font-mono">
              REG: {registration_number}
            </p>
          )}
        </div>
      </td>

      {/* Dimensiones */}
      <td className="px-6 py-5">
        {renderDimensions()}
      </td>

      {/* Precio */}
      <td className="px-6 py-5">
        {renderPrice()}
      </td>

      {/* Reservado Por */}
      <td className="px-6 py-5">
        {renderReservedBy()}
      </td>

      {/* Estado */}
      <td className="px-6 py-5">
        <div className="flex w-full items-center">
          <span className={badgeClass}>{statusLabel}</span>
        </div>
      </td>

      {/* Acciones */}
      <td className="px-6 py-5">
        {renderActions()}
      </td>
    </>
  );
}

LotItem.propTypes = {
  lot: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    project_name: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    registration_number: PropTypes.string,
    dimensions: PropTypes.string.isRequired,
    measurement_unit: PropTypes.string,
    area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    override_area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    override_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reserved_by: PropTypes.string,
    reserved_by_user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    contract_created_by: PropTypes.string,
    contract_created_user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string.isRequired,
    contract_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  userRole: PropTypes.string.isRequired,
  isMobileCard: PropTypes.bool,
  isHighlighted: PropTypes.bool,
};

export default LotItem;
