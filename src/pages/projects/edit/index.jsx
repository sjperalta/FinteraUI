import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from './../../../../config';
import { getToken } from './../../../../auth';

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getToken();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lotCount, setLotCount] = useState(0);
  const [pricePerSquareUnit, setPricePerSquareUnit] = useState(0);
  const [measurementUnit, setMeasurementUnit] = useState("m2");
  const [interestRate, setInterestRate] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoadingProject(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/v1/projects/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load project");
        const data = await res.json();
        setName(data.name || "");
        setDescription(data.description || "");
        setAddress(data.address || "");
        setLotCount(data.lot_count || 0);
        setPricePerSquareUnit(data.price_per_square_unit || 0);
        setMeasurementUnit(data.measurement_unit || "m2");
        setInterestRate(data.interest_rate || 0);
        setCommissionRate(data.commission_rate || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project: {
            name,
            description,
            address,
            lot_count: Number(lotCount),
            price_per_square_unit: Number(pricePerSquareUnit),
            measurement_unit: measurementUnit,
            interest_rate: Number(interestRate),
            commission_rate: Number(commissionRate),
          }
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error updating project");
      }

      navigate("/projects");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProject) {
    return <main className="w-full xl:px-[48px] px-6 pb-6 sm:pt-[156px] pt-[100px]">Loading project...</main>;
  }

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="max-w-2xl mx-auto bg-white dark:bg-darkblack-600 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-bgray-900 dark:text-white mb-6">Editar Proyecto</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Nombre del Proyecto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese el nombre del proyecto"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese una descripción"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Dirección</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese la dirección del proyecto"
            />
          </div>

          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Cantidad de Lotes</label>
              <input
                type="number"
                value={lotCount}
                onChange={(e) => setLotCount(Number(e.target.value))}
                required
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder="Ingrese la cantidad de lotes"
              />
            </div>

            {/* Measurement Unit */}
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
                Unidad de Medida
              </label>
              <select
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)}
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              >
                <option value="m2">m²</option>
                <option value="ft2">ft²</option>
                <option value="vara2">v²</option>
              </select>
            </div>
          </div>

          {/* Precio por Unidad */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Precio por {measurementUnit === 'm2' ? 'm²' : measurementUnit === 'ft2' ? 'ft²' : 'v²'}
            </label>
            <input
              type="number"
              value={pricePerSquareUnit}
              onChange={(e) => setPricePerSquareUnit(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese el precio por unidad"
            />
          </div>

          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Tasa de Interés Anual</label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                required
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder="Ingrese la tasa de interés"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">Tasa de Comisión (%)</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                required
                className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
                placeholder="Ingrese la tasa de comisión"
              />
            </div>
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
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProject;