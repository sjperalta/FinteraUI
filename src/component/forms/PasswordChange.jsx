import { useState } from "react";
import PropTypes from "prop-types";
import { API_URL } from "./../../../config"; // Update the path as needed

function PasswordChange({ token, userId }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic client-side validation
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/users/${userId}/change_password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Ensure you have the token from AuthContext or props
        },
        body: JSON.stringify({
          password_change: {
            userId: userId, 
            old_password: oldPassword,
            new_password: newPassword,
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Contraseña actualizada exitosamente.");
        setOldPassword("");
        setNewPassword("");
      } else {
        setError(data.errors ? data.errors.join(", ") : "Error al actualizar la contraseña.");
      }
    } catch (err) {
      setError("Error de red. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      {/* Old Password Field */}
      <div className="relative flex flex-col mb-6">
        <label
          htmlFor="oldPassword"
          className="text-sm block mb-3 font-medium text-bgray-500 dark:text-darkblack-300"
        >
          Nueva Contraseña
        </label>
        <input
          type={showOldPassword ? "text" : "password"}
          id="oldPassword"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white rounded-lg w-full h-14 px-4 py-5 border-0 focus:border focus:border-success-300 focus:ring-0"
          required
        />
        <button
          type="button"
          onClick={() => setShowOldPassword(!showOldPassword)}
          className="absolute right-4 top-12"
          aria-label={showOldPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showOldPassword ? (
            // Icon for hiding password (e.g., eye with slash)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.832-6.906M6.414 6.414A9.97 9.97 0 0012 5c5.523 0 10 4.477 10 10a9.97 9.97 0 01-1.414 5.586M15 15l-3-3m0 0l-3-3m3 3V6"
              />
            </svg>
          ) : (
            // Icon for showing password (e.g., eye)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* New Password Field */}
      <div className="relative flex flex-col mb-6">
        <label
          htmlFor="newPassword"
          className="text-sm block mb-3 font-medium text-bgray-500 dark:text-darkblack-300"
        >
          Repetir Contraseña
        </label>
        <input
          type={showNewPassword ? "text" : "password"}
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white rounded-lg w-full h-14 px-4 py-5 border-0 focus:border focus:border-success-300 focus:ring-0"
          required
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-4 top-12"
          aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showNewPassword ? (
            // Icon for hiding password
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.832-6.906M6.414 6.414A9.97 9.97 0 0012 5c5.523 0 10 4.477 10 10a9.97 9.97 0 01-1.414 5.586M15 15l-3-3m0 0l-3-3m3 3V6"
              />
            </svg>
          ) : (
            // Icon for showing password
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
        <small className="text-xs text-bgray-500 dark:text-darkblack-300 block mt-1">
          Mínimo 6 caracteres
        </small>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Success Message */}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className={`text-sm bg-success-300 hover:bg-success-400 transition-all py-3 px-4 text-white font-semibold rounded-lg ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}

PasswordChange.propTypes = {
  token: PropTypes.string.isRequired, // Ensure token is passed as a prop
};

export default PasswordChange;