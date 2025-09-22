import { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";
import { API_URL } from "../../../../../config";
import { getToken } from "../../../../../auth";

function CreateLot() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const token = getToken();

  const [name, setName] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("m2");
  const [overridePrice, setOverridePrice] = useState(false);
  const [overridePriceValue, setOverridePriceValue] = useState("");
  const [address, setAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [note, setNote] = useState("");

  const [projectPricePerUnit, setProjectPricePerUnit] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error cargando el proyecto");
        const data = await res.json();
        setProjectName(data.name || "");
        setProjectPricePerUnit(data.price_per_square_unit || 0);
        setMeasurementUnit(data.measurement_unit || "m2");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchProject();
  }, [projectId, token]);

  const areaM2 = useMemo(() => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    return +(l * w).toFixed(2);
  }, [length, width]);

  const displayedArea = useMemo(() => {
    switch ((measurementUnit || "").toLowerCase()) {
      case "ft2":
        return +(areaM2 * 10.7639).toFixed(2);
      case "vara2":
        return +(areaM2 * 1.431).toFixed(2);
      case "m2":
      default:
        return areaM2;
    }
  }, [areaM2, measurementUnit]);

  const calculatedPrice = useMemo(() => {
    return +(displayedArea * Number(projectPricePerUnit || 0)).toFixed(2);
  }, [displayedArea, projectPricePerUnit]);

  const effectivePricePreview = overridePrice && Number(overridePriceValue) > 0 ? Number(overridePriceValue) : calculatedPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setError(null);

    const fe = {};
    if (!name.trim()) fe.name = "Nombre requerido";
    if (!(Number(length) > 0)) fe.length = "Longitud debe ser > 0";
    if (!(Number(width) > 0)) fe.width = "Anchura debe ser > 0";
    if (overridePrice && !(Number(overridePriceValue) > 0)) fe.override_price = "Precio debe ser > 0";

    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/v1/projects/${projectId}/lots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lot: {
            name,
            length: Number(length),
            width: Number(width),
            // send override_price when provided to let backend override calculated price
            ...(overridePrice ? { override_price: Number(overridePriceValue) } : {}),
            measurement_unit: measurementUnit,
            address: address || "",
            registration_number: registrationNumber || "",
            note: note || "",
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const message = errData.error || (errData.errors && errData.errors.join(", ")) || "Error creando lote";
        throw new Error(message);
      }

      // On success navigate back to lots list
      navigate(`/projects/${projectId}/lots`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader">Cargando...</div>;

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="max-w-2xl mx-auto bg-white dark:bg-darkblack-600 p-8 rounded-lg">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-bgray-900 dark:text-white">Crear Nuevo Lote</h2>
          {projectName && (
            <p className="text-sm text-bgray-600 dark:text-bgray-50 mt-1">
              Proyecto: <span className="font-semibold">{projectName}</span> • Unidad: {measurementUnit}
            </p>
          )}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
            />
            {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
          </div>

          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Longitud ({measurementUnit})</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              />
              {fieldErrors.length && <p className="text-xs text-red-500 mt-1">{fieldErrors.length}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Anchura ({measurementUnit})</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              />
              {fieldErrors.width && <p className="text-xs text-red-500 mt-1">{fieldErrors.width}</p>}
            </div>
          </div>

          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Área ({measurementUnit})</label>
              <input
                type="text"
                value={displayedArea}
                readOnly
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg bg-gray-100 dark:bg-darkblack-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Precio estimado HNL</label>
              <input
                type="text"
                value={effectivePricePreview}
                readOnly
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg bg-gray-100 dark:bg-darkblack-500 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2 gap-3">
              <input
                id="overridePrice"
                type="checkbox"
                checked={overridePrice}
                onChange={(e) => setOverridePrice(e.target.checked)}
                className="h-4 w-4 text-success-300 focus:ring-success-300 border-bgray-300 rounded"
              />
              <label htmlFor="overridePrice" className="text-sm font-medium text-bgray-900 dark:text-white">
                Sobrescribir precio manualmente
              </label>
            </div>
            {overridePrice && (
              <div>
                <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Precio Manual (HNL)</label>
                <input
                  type="number"
                  value={overridePriceValue}
                  onChange={(e) => setOverridePriceValue(e.target.value)}
                  className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                />
                {fieldErrors.override_price && <p className="text-xs text-red-500 mt-1">{fieldErrors.override_price}</p>}
              </div>
            )}
          </div>

          {/* Optional metadata */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Dirección</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Dirección del lote (opcional)"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Número de Registro</label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Número de registro (opcional)"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Nota</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Notas adicionales (opcional)"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white mt-4 py-3.5 px-4 rounded-lg"
            >
              Volver
            </button>
            <button
              type="submit"
              className="bg-success-300 hover:bg-success-400 text-white font-bold mt-4 py-3.5 px-4 rounded-lg"
              disabled={saving || user?.role !== "admin"}
            >
              {saving ? "Creando..." : "Crear Lote"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateLot;