import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from './../../../../config';
import { getToken } from './../../../../auth';

function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lotCount, setLotCount] = useState(0);
  const [pricePerSquareFoot, setPricePerSquareFoot] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0); // New state for commission rate
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          address,
          lot_count: lotCount,
          price_per_square_foot: pricePerSquareFoot,
          interest_rate: interestRate,
          commission_rate: commissionRate, // Include the commission rate
        }),
      });

      if (response.ok) {
        navigate('/projects');
      } else {
        console.log('Error al crear el proyecto');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="max-w-2xl mx-auto bg-white dark:bg-darkblack-600 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-bgray-900 dark:text-white mb-6">
          Crear Nuevo Proyecto
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese el nombre del proyecto"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese una descripción"
            />
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese la dirección del proyecto"
            />
          </div>

          {/* Lot Count */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Cantidad de Lotes
            </label>
            <input
              type="number"
              value={lotCount}
              onChange={(e) => setLotCount(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese la cantidad de lotes"
            />
          </div>

          {/* Price Per Square Foot */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Precio por Vara Cuadrada
            </label>
            <input
              type="number"
              value={pricePerSquareFoot}
              onChange={(e) => setPricePerSquareFoot(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese el precio por vara cuadrada"
            />
          </div>

          {/* Interest Rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Tasa de Interés Anual
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese la tasa de interés"
            />
          </div>

          {/* Commission Rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-bgray-900 dark:text-white mb-2">
              Tasa de Comisión (%)
            </label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              required
              className="w-full h-12 px-4 py-3 border border-bgray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white"
              placeholder="Ingrese la tasa de comisión"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white mt-10 py-3.5 px-4 rounded-lg"
            >
              Volver
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold mt-10 py-3.5 px-4 rounded-lg"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateProject;