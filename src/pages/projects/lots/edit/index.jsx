import { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";
import { API_URL } from "../../../../../config";
import { getToken } from "../../../../../auth";

// ---- Area conversion factors (from m2) ----
const M2_TO_FT2_FACTOR = 10.7639;
const M2_TO_VARA2_FACTOR = 1.431;
const AREA_CONVERSION_FROM_M2 = {
  m2: 1,
  ft2: M2_TO_FT2_FACTOR,
  vara2: M2_TO_VARA2_FACTOR,
};

function EditLot() {
  const { project_id, lot_id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const token = getToken();

  const [name, setName] = useState("");
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [measurementUnit, setMeasurementUnit] = useState("m2");
  const [balance, setBalance] = useState(0);
  const [status, setStatus] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectPricePerUnit, setProjectPricePerUnit] = useState(0);
  const [address, setAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [note, setNote] = useState("");
  // Whether user wants to override price (local UI toggle)
  const [overridePrice, setOverridePrice] = useState(false);
  // Manual override value bound to backend field override_price
  const [overridePriceValue, setOverridePriceValue] = useState("");
  // Server authoritative calculated/base price (lot.price)
  const [serverPrice, setServerPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);

  useEffect(() => {
    const fetchLot = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error loading lot");
        const data = await res.json();
        setName(data.name || "");
        setLength(data.length ?? 0);
        setWidth(data.width ?? 0);
        setMeasurementUnit(data.measurement_unit || data.unit || "m2");
        setBalance(data.balance || 0);
        setStatus(data.status || "");
        setAddress(data.address || "");
        setRegistrationNumber(data.registration_number || data.registrationNumber || "");
        setNote(data.note || "");
        if (data.price != null) setServerPrice(data.price); // backend-calculated price
        if (data.override_price != null) {
          setOverridePriceValue(String(data.override_price));
          setOverridePrice(true); // auto-enable if backend already has an override
        }
        // fetch project info separately for header context & price unit
        const pres = await fetch(`${API_URL}/api/v1/projects/${project_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (pres.ok) {
          const pdata = await pres.json();
          setProjectName(pdata.name || "");
          setProjectPricePerUnit(pdata.price_per_square_unit || 0);
          // prefer project measurement unit if lot one missing
          if (!data.measurement_unit && pdata.measurement_unit) {
            setMeasurementUnit(pdata.measurement_unit);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLot();
  }, [project_id, lot_id, token]);

  // Derived area always in m2
  const areaM2 = useMemo(() => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    return +(l * w).toFixed(2);
  }, [length, width]);

  // Convert area into selected measurement unit using constants
  const displayedArea = useMemo(() => {
    const factor = AREA_CONVERSION_FROM_M2[measurementUnit] || 1;
    return +(areaM2 * factor).toFixed(2);
  }, [areaM2, measurementUnit]);

  const calculatedPrice = useMemo(() => {
    // projectPricePerUnit already corresponds to measurementUnit for display
    return +(displayedArea * Number(projectPricePerUnit || 0)).toFixed(2);
  }, [displayedArea, projectPricePerUnit]);

  // Effective price to show as current applied price (server authoritative if exists, else live calc)
  const effectiveServerPrice = serverPrice != null ? serverPrice : calculatedPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setServerErrors([]);
    setFieldErrors({});

    // Basic client-side validation
    const fe = {};
    if (!name.trim()) fe.name = "Nombre requerido";
    if (!(Number(length) > 0)) fe.length = "Longitud debe ser > 0";
    if (!(Number(width) > 0)) fe.width = "Anchura debe ser > 0";
  if (overridePrice && !(Number(overridePriceValue) > 0)) fe.override_price = "Precio debe ser > 0";
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/projects/${project_id}/lots/${lot_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lot: {
            name,
            length: Number(length),
            width: Number(width),
            // Persist manual override in override_price only when toggled
            ...(overridePrice ? { override_price: Number(overridePriceValue) } : { override_price: null }),
            address: address || "",
            registration_number: registrationNumber || "",
            note: note || ""
          }
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 422) {
          // Rails usually returns { errors: [...] } or { error: "..." }
            const errs = errData.errors || (errData.error ? [errData.error] : ["Error de validación desconocido"]);
            setServerErrors(errs);
            setSaving(false);
            return;
        }
        throw new Error(errData.error || errData.errors?.join(", ") || "Error updating lot");
      }

      navigate(`/projects/${project_id}/lots`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader">Cargando lote...</div>;

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="max-w-2xl mx-auto bg-white dark:bg-darkblack-600 p-8 rounded-lg">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-bgray-900 dark:text-white">Editar Lote</h2>
          {projectName && (
            <p className="text-sm text-bgray-600 dark:text-bgray-50 mt-1">
              Proyecto: <span className="font-semibold">{projectName}</span> • Unidad: {measurementUnit}
            </p>
          )}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!!serverErrors.length && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 text-sm rounded p-3">
            <p className="font-semibold mb-1">Errores del servidor:</p>
            <ul className="list-disc list-inside space-y-1">
              {serverErrors.map((se, i) => <li key={i}>{se}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
            />
            {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
          </div>       

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Dirección</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Dirección del lote"
            />
          </div>

          {/* Registration Number */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Número de Registro</label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Número de registro del lote"
            />
          </div>

          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Estado</label>
              <input
                type="text"
                value={status}
                readOnly
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg bg-gray-100 dark:bg-darkblack-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Precio Base Unidad</label>
              <input
                type="text"
                value={projectPricePerUnit}
                readOnly
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg bg-gray-100 dark:bg-darkblack-500 dark:text-white"
              />
            </div>
          </div>


         {/* Read-only combined dimensions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Dimensiones</label>
            <input
              type="text"
              value={`${length} x ${width} ${measurementUnit}`}
              readOnly
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg bg-gray-100 dark:bg-darkblack-500 dark:text-white"
            />
          </div>

          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Longitud ({measurementUnit})</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={length}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLength(v < 0 ? 0 : v);
                }}
                required
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
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setWidth(v < 0 ? 0 : v);
                }}
                required
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-bgray-900 dark:text-white">Precio HNL</label>
                {(overridePrice && Number(overridePriceValue) > 0) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-warning-300 text-white dark:bg-success-300">
                    Sobrescrito
                  </span>
                )}
              </div>
              <input
                type="text"
                value={effectiveServerPrice}
                readOnly
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg bg-gray-100 dark:bg-darkblack-500 dark:text-white"
              />
              {serverPrice != null && serverPrice !== calculatedPrice && (
                <p className="text-xs text-bgray-600 dark:text-bgray-50 mt-1">Calculo Precio (area * precio base): {calculatedPrice}</p>
              )}
              {(overridePrice && Number(overridePriceValue) > 0 && serverPrice != null) && (
                <p className="text-xs text-error-300 mt-1">Precio manual aplicado: {overridePriceValue}</p>
              )}
            </div>
          </div>

          {/* Price Override */}
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
                  placeholder="Ingrese el precio manual"
                />
                {fieldErrors.override_price && <p className="text-xs text-red-500 mt-1">{fieldErrors.override_price}</p>}
                <p className="text-xs text-bgray-600 dark:text-bgray-50 mt-1">Al guardar, se almacenará en override_price y reemplazará el precio calculado.</p>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Nota</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Notas adicionales sobre el lote"
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
              disabled={saving || user?.role !== 'admin'}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditLot;
