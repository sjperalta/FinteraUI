import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function LotData({ lotInfo, index }) {
  const {
    id,
    project_id,
    name,
    price,
    balance,
    area,
    length,
    width,
    status,
  } = lotInfo;

  return (
    <tr className={index % 2 === 0 ? "bg-white dark:bg-darkblack-600" : ""}>
      <td className="whitespace-nowrap py-4 text-sm text-gray-500 w-[400px] lg:w-auto">
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <h4 className="font-bold text-lg text-bgray-900 dark:text-white">
              {name}
            </h4>
            <div>
              <span className="font-medium text-base text-bgray-700 dark:text-bgray-50">
                Area: {area} m² •{" "}
              </span>
              <span className="font-medium text-base text-bgray-700 dark:text-bgray-50">
                Largo: {length} m
              </span>•{" "}
              <span className="font-medium text-base text-bgray-700 dark:text-bgray-50">
                Ancho: {width} m
              </span>•{" "}
              <span className="font-medium text-base text-bgray-700 dark:text-bgray-50">
                Precio: {price} HNL
              </span>•{" "}
              <span className="font-medium text-base text-bgray-700 dark:text-bgray-50">
                Balance: {balance} HNL
              </span>•{" "}
            </div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <span
          className={`bg-success-50 dark:bg-darkblack-500 text-sm ${
            status === "available"
              ? "text-success-300"
              : "text-error-300"
          } font-medium rounded-lg py-1 px-3`}
        >
          {status === "available" ? "Disponible" : "Reservado"}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {status === 'available' ? (
          <Link
            to={`/projects/${project_id}/lots/${id}/contracts/create`} // Redirecciona al formulario para crear contrato
            className="bg-success-300 hover:bg-success-400 text-white font-bold py-2 px-4 rounded"
          >
            Reservar
          </Link>
        ) : (
          <span className="text-error-300">No disponible</span>
        )}
      </td>
    </tr>
  );
}

LotData.propTypes = {
  lotInfo: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

export default LotData;