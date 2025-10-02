import { useState, useContext, useEffect } from "react";
import { API_URL } from "./../../../../config";
import { getToken } from "./../../../../auth";
import { useNavigate } from "react-router-dom";
import AuthContext from "./../../../context/AuthContext";

function formatCedula(raw) {
  const d = raw.replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  return out;
}

function formatRTN(raw) {
  const d = raw.replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  const g4 = d.slice(13, 14);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  if (g4) out += `-${g4}`;
  return out;
}

function evaluatePasswordStrength(pw) {
  const criteria = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };

  const score = Object.values(criteria).reduce((s, ok) => s + (ok ? 1 : 0), 0);
  let label = "";
  if (score <= 2) label = "Weak";
  else if (score <= 4) label = "Medium";
  else label = "Strong";

  return { label, score, criteria };
}

function CreateUser() {
  const navigate = useNavigate();
  const { user: creator } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    identity: "",
    rtn: "",
    address: "",
    password: "",
    password_confirmation: "",
    role: "user",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pwFeedback, setPwFeedback] = useState({ label: "", score: 0 });
  const [pwMatch, setPwMatch] = useState(true);

  const token = getToken();

  useEffect(() => {
    const info = evaluatePasswordStrength(formData.password);
    setPwFeedback(info);
    setPwMatch(formData.password === formData.password_confirmation);
  }, [formData.password, formData.password_confirmation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "identity") {
      v = formatCedula(value);
    } else if (name === "rtn") {
      v = formatRTN(value);
    }
    setFormData({ ...formData, [name]: v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim()) {
      setError("Nombre completo es requerido.");
      return;
    }
    if (!(formData.identity.replace(/\D/g, "").length === 13)) {
      setError("Cédula inválida. Formato esperado: 0999-1999-00999");
      return;
    }
    if (!(formData.rtn.replace(/\D/g, "").length === 14)) {
      setError("RTN inválido. Formato esperado: 0999-1999-00999-0");
      return;
    }
    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!pwMatch) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Ensure non-admin creators can only create users with role 'user'
      const safeRole = creator?.role === 'admin' ? formData.role : 'user';
      const payload = {
        ...formData,
        role: safeRole,
        created_by: creator?.id,
      };

      const response = await fetch(`${API_URL}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: payload }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("application/json")
          ? await response.json().catch(() => ({}))
          : await response.text().catch(() => (response.statusText || ""));
        const msg = body?.errors ? body.errors.join(", ") : body?.error || String(body) || "Error creando usuario";
        throw new Error(msg);
      }

      // Parse created user id and redirect to its detail page when available
      const successBody = await response.json().catch(() => ({}));
      const newUserId = successBody?.id || successBody?.user?.id || successBody?.data?.id;
      setSuccess(true);
      if (newUserId) {
        navigate(`/settings/user/${newUserId}`);
      } else {
        navigate("/users");
      }
    } catch (err) {
      setSuccess(false);
      setError(err.message);
    }
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold pb-5 text-bgray-900 dark:text-white border-b border-bgray-200">
          Crear Usuario
        </h2>
        {success && <p className="text-green-500">Usuario creado exitosamente. Redirigiendo...</p>}
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
              placeholder="0999-1999-00999"
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
              placeholder="0999-1999-00999-0"
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
            <label htmlFor="address" className="text-base font-medium">
              Dirección
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección (opcional)"
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
            <div className="mt-2">
              <div className="mb-2">
                <div className="w-full bg-bgray-100 dark:bg-darkblack-500 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-200 ${
                      pwFeedback.score >= 5
                        ? 'bg-green-500'
                        : pwFeedback.score >= 3
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(pwFeedback.score / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${pwFeedback.label === 'Strong' ? 'text-green-600' : pwFeedback.label === 'Medium' ? 'text-yellow-500' : 'text-red-600'}`}>
                    Contraseña: {pwFeedback.label || '—'}
                  </span>
                </div>
                <div className="text-xs text-bgray-500 dark:text-bgray-400">{formData.password.length} / 8 chars</div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px] ${pwFeedback.criteria?.length ? 'bg-green-500' : 'bg-bgray-300 dark:bg-darkblack-400'}`}>
                    {pwFeedback.criteria?.length ? '✓' : ''}
                  </span>
                  <span className="text-bgray-700 dark:text-gray-300">Al menos 8 caracteres</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px] ${pwFeedback.criteria?.upper ? 'bg-green-500' : 'bg-bgray-300 dark:bg-darkblack-400'}`}>
                    {pwFeedback.criteria?.upper ? '✓' : ''}
                  </span>
                  <span className="text-bgray-700 dark:text-gray-300">Una letra mayúscula (A-Z)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px] ${pwFeedback.criteria?.lower ? 'bg-green-500' : 'bg-bgray-300 dark:bg-darkblack-400'}`}>
                    {pwFeedback.criteria?.lower ? '✓' : ''}
                  </span>
                  <span className="text-bgray-700 dark:text-gray-300">Una letra minúscula (a-z)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px] ${pwFeedback.criteria?.number ? 'bg-green-500' : 'bg-bgray-300 dark:bg-darkblack-400'}`}>
                    {pwFeedback.criteria?.number ? '✓' : ''}
                  </span>
                  <span className="text-bgray-700 dark:text-gray-300">Al menos un número (0-9)</span>
                </li>
                <li className="flex items-center gap-2 col-span-1 sm:col-span-2">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px] ${pwFeedback.criteria?.symbol ? 'bg-green-500' : 'bg-bgray-300 dark:bg-darkblack-400'}`}>
                    {pwFeedback.criteria?.symbol ? '✓' : ''}
                  </span>
                  <span className="text-bgray-700 dark:text-gray-300">Al menos un carácter especial (ej. !@#$%)</span>
                </li>
              </ul>
              <div className="sr-only" aria-live="polite">
                {pwFeedback.label ? `Password strength ${pwFeedback.label}` : ''}
              </div>
            </div>
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
            <div className="mt-2 text-sm">
              {formData.password_confirmation ? (
                pwMatch ? (
                  <span className="text-green-600">Las contraseñas coinciden</span>
                ) : (
                  <span className="text-red-600">Las contraseñas no coinciden</span>
                )
              ) : null}
            </div>
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
                disabled={creator?.role !== 'admin'}
              >
                <option value="user">Usuario</option>
                {creator?.role === 'admin' && <option value="admin">Administrador</option>}
                {creator?.role === 'admin' && <option value="seller">Vendedor</option>}
              </select>
              {creator?.role !== 'admin' && (
                <p className="text-xs text-gray-500 mt-1">Solo los administradores pueden elegir otro rol; se asignará 'Usuario'.</p>
              )}
          </div>

          {/* Creator read-only field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="created_by" className="text-base font-medium">
              Creado por
            </label>
            <input
              type="text"
              id="created_by"
              name="created_by"
              value={creator?.full_name || ""}
              readOnly
              disabled
              className="bg-bgray-100 dark:bg-darkblack-500 p-4 rounded-lg border-0 text-bgray-700"
            />
          </div>

          <div className="flex justify-between">
            <button
              aria-label="none"
              type="button"
              onClick={() => navigate(-1)}
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