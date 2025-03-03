import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import PropTypes from "prop-types";
import { useState } from "react";

function ReportSelect({ contract_id, financing_type }) {
  const [filterShow, setFilterShow] = useState(false);
  const token = getToken();

  /**
   * Realiza la solicitud POST para descargar el reporte.
   * URL y método siguiendo tu mismo esquema (/approve, /reject, /cancel).
   */
  const handleDownload = async (report_name) => {

    try {
      let endpoint = `${API_URL}/api/v1/reports/${report_name}?contract_id=${contract_id}`;
      if (financing_type && report_name === 'user_promise_contract_pdf') {
        endpoint += `&financing_type=${financing_type}`;
      }
      const response = await fetch(endpoint,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error downloading ${report_name}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert(`${report_name} descargado exitosamente.`);
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  /**
   * Devuelve las opciones de reportes según el tipo de financiamiento.
   */
  const getReportOptions = () => {
    const options = [
      { key: "user_promise_contract_pdf", label: "Promesa de Compra Venta" },
      { key: "user_rescission_contract_pdf", label: "Rescisión de Contrato" },
      { key: "user_information_pdf", label: "Ficha de Cliente" },
    ];

    // Mostrar "Promesa de Compra Venta" solo si es direct, cash o bank
    if (!["direct", "cash", "bank"].includes(financing_type?.toLowerCase())) {
      return options.filter((opt) => opt.key !== "promesa_compra_venta");
    }

    return options;
  };

  return (
    <div className="report-select relative mb-3">
      <button
        aria-label="none"
        name="button"
        onClick={() => setFilterShow(!filterShow)}
        type="button"
        className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-1 px-3 rounded"
      >
        Reportes
      </button>
      {filterShow && (
        <div
          id="cardsOptions"
          className="absolute right-0 top-full z-10 min-w-[180px] overflow-hidden rounded-lg bg-white shadow-lg"
        >
          <ul>
            {getReportOptions().map(({ key, label }) => (
              <li
                key={key}
                onClick={() => handleDownload(key, financing_type)}
                className="cursor-pointer px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

ReportSelect.propTypes = {
  financing_type: PropTypes.string.isRequired,
};

export default ReportSelect;