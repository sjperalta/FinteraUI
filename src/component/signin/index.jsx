import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoColor from "../../assets/images/logo/logo-color.svg";
import logoWhite from "../../assets/images/logo/logo-white.svg";
import PasswordResetModal from "../modal/PasswordResetModal";
import AuthContext from '../../context/AuthContext'; 

function LeftSide() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState("");

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("superPassword@123");
  const [errors, setErrors] = useState({ email: "", password: "" });
  
  const navigate = useNavigate();
  const { login, loading, error: apiError } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;

    const result = await login(email, password);
    if (result?.success) {
      var user = result.user;
      if(user.role === 'admin')
        navigate("/");
      else {
        navigate(`/balance/user/${user.id}`);
      }
    }
    // If not success, error is handled by apiError from context
  };

  return (
    <div className="lg:w-1/2 px-5 xl:pl-12 pt-10">
      <PasswordResetModal
        isActive={modalOpen}
        modalData={modalData}
        handelModalData={setModalData}
        handleActive={setModalOpen}
      />
      <header>
        <Link to="/" className="">
          <img src={logoColor} className="block dark:hidden" alt="Logo" />
          <img src={logoWhite} className="hidden dark:block" alt="Logo" />
        </Link>
      </header>
      <div className="max-w-[450px] m-auto pt-24 pb-16">
        <header className="text-center mb-8">
          <h2 className="text-bgray-900 dark:text-white text-4xl font-semibold font-poppins mb-2">
            Inicia Sesion en Fintera
          </h2>
          <p className="font-urbanis text-base font-medium text-bgray-600 dark:text-bgray-50">
            Gestiona tus Pagos Eficientemente
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <a
            href="#"
            className="inline-flex justify-center items-center gap-x-2 border border-bgray-300 dark:border-darkblack-400 rounded-lg px-6 py-4 text-base text-bgray-900 dark:text-white font-medium"
          >
            <svg
              width="23"
              height="22"
              viewBox="0 0 23 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.8758 11.2137C20.8758 10.4224 20.8103 9.84485 20.6685 9.24597H11.4473V12.8179H16.8599C16.7508 13.7055 16.1615 15.0424 14.852 15.9406L14.8336 16.0602L17.7492 18.2737L17.9512 18.2935C19.8063 16.6144 20.8758 14.144 20.8758 11.2137Z"
                fill="#4285F4"
              />
              <path
                d="M11.4467 20.625C14.0984 20.625 16.3245 19.7694 17.9506 18.2936L14.8514 15.9408C14.022 16.5076 12.9089 16.9033 11.4467 16.9033C8.84946 16.9033 6.64512 15.2243 5.85933 12.9036L5.74415 12.9131L2.7125 15.2125L2.67285 15.3205C4.28791 18.4647 7.60536 20.625 11.4467 20.625Z"
                fill="#34A853"
              />
              <path
                d="M5.86006 12.9036C5.65272 12.3047 5.53273 11.663 5.53273 11C5.53273 10.3369 5.65272 9.69524 5.84915 9.09636L5.84366 8.96881L2.774 6.63257L2.67357 6.67938C2.00792 7.98412 1.62598 9.44929 1.62598 11C1.62598 12.5507 2.00792 14.0158 2.67357 15.3205L5.86006 12.9036Z"
                fill="#FBBC05"
              />
              <path
                d="M11.4467 5.09664C13.2909 5.09664 14.5349 5.87733 15.2443 6.52974L18.0161 3.8775C16.3138 2.32681 14.0985 1.375 11.4467 1.375C7.60539 1.375 4.28792 3.53526 2.67285 6.6794L5.84844 9.09638C6.64514 6.77569 8.84949 5.09664 11.4467 5.09664Z"
                fill="#EB4335"
              />
            </svg>
            <span>Inicia con Google</span>{" "}
          </a>
        </div>

        <div className="relative mt-6 mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-darkblack-400"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-darkblack-500 px-2 text-base text-bgray-600">
            Continua con
            </span>
          </div>
        </div>

        {/* Formulario controlado */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              className="text-bgray-800 text-base border border-bgray-300 dark:border-darkblack-400 dark:bg-darkblack-500 dark:text-white h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-bgray-500 placeholder:text-base"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div className="mb-6 relative">
            <input
              type="password"
              className="text-bgray-800 text-base border border-bgray-300 dark:border-darkblack-400 dark:bg-darkblack-500 dark:text-white h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-bgray-500 placeholder:text-base"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <div className="flex justify-between mb-7">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="w-5 h-5 dark:bg-darkblack-500 focus:ring-transparent rounded-full border border-bgray-300 focus:accent-success-300 text-success-300"
                name="remember"
                id="remember"
              />
              <label
                htmlFor="remember"
                className="text-bgray-900 dark:text-white text-base font-semibold"
              >
                Recordarme
              </label>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-success-300 font-semibold text-base underline"
              >
                Olvide Contraseña?
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="py-3.5 flex items-center justify-center text-white font-bold bg-success-300 hover:bg-success-400 transition-all rounded-lg w-full"
          >
            {loading ? "Signing In..." : "Iniciar Sesión"}
          </button>
        </form>

        {apiError && <p className="text-red-500 text-sm mt-4 text-center">{apiError}</p>}

        <p className="text-center text-bgray-900 dark:text-bgray-50 text-base font-medium pt-7">
          No tienes cuenta?{" "}
          <Link to="/signup" className="font-semibold underline">
            Crear Cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LeftSide;