import { useState } from "react";
import { API_URL } from './../../../../config'; // Adjust the import based on your project structure
import { getToken } from './../../../../auth'; // Utility for authentication token
import { useNavigate } from "react-router-dom";

function CreateUser() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        identity: "",
        rtn: "",
        password: "",
        password_confirmation: "",
        role: "user", // Default role
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const token = getToken();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/v1/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ user: formData }),
            });

            if (!response.ok) {
                const { errors } = await response.json();
                throw new Error(errors.join(", "));
            }

            setSuccess(true);
            setError(null);
        } catch (error) {
            setSuccess(false);
            setError(error.message);
        }
    };

    return (
        <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
            <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold pb-5 text-bgray-900 dark:text-white border-b border-bgray-200">
                    Crear Usuario
                </h2>
                {success && (
                    <p className="text-green-500">Usuario creado exitosamente.</p>
                )}
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="mt-5 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="full_name" className="text-base font-medium">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            className="bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="identity" className="text-base font-medium">
                            Cedula
                        </label>
                        <input
                            type="text"
                            id="identity"
                            name="identity"
                            value={formData.identity}
                            onChange={handleChange}
                            required
                            className="bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="rtn" className="text-base font-medium">
                            RTN
                        </label>
                        <input
                            type="text"
                            id="rtn"
                            name="rtn"
                            value={formData.rtn}
                            onChange={handleChange}
                            required
                            className="bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="phone" className="text-base font-medium">
                            Telefono
                        </label>
                        <input
                            type="phone"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-base font-medium">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-base font-medium">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password_confirmation" className="text-base font-medium">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                            className="bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="role" className="text-base font-medium">
                            Rol
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-lg border-0 focus:ring-2 focus:ring-success-300"
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                            <option value="seller">Vendedor</option>
                        </select>
                    </div>
                    <div className="flex justify-between">
                        <button
                            aria-label="none"
                            type="button"
                            onClick={() => navigate(-1)} // Botón de regresar
                            className="bg-gray-500 hover:bg-gray-600 text-white mt-10 py-3.5 px-4 rounded-lg"
                        >
                            Volver
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold mt-10 py-3.5 px-4 rounded-lg"
                        >
                            Crear Usuario
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default CreateUser;