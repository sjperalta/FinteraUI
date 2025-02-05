import React, { useState, useRef, useEffect } from "react";
import ProtoTypes from "prop-types";
import { Link } from "react-router-dom";
import logoColor from "../../assets/images/logo/logo-color.svg";
import logoWhite from "../../assets/images/logo/logo-white.svg";
import { API_URL } from "../../../config";

// Cross button component remains the same
export const CrossBtn = ({ close }) => (
  <div className="absolute top-0 right-0 pt-5 pr-5">
    <button
      aria-label="none"
      type="button"
      onClick={close}
      className="rounded-md bg-white dark:bg-darkblack-500 focus:outline-none"
    >
      <span className="sr-only">Close</span>
      <svg
        className="stroke-darkblack-300"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 6L18 18M6 18L18 6L6 18Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
);

export const HeadingLogo = () => (
  <Link to="/signin" className="block mb-7">
    <img src={logoColor} className="block dark:hidden" alt="" />
    <img src={logoWhite} className="hidden dark:block" alt="" />
  </Link>
);

export const ResetPass = ({ email, setEmail, error, loading, onSubmit, onClose }) => (
  <div className="step-content step-1">
    <div className="relative max-w-[492px] transform overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 p-8 text-left transition-all">
      <CrossBtn close={onClose} />
      <div>
        <HeadingLogo />
        <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
          Restablecer tu contraseña
        </h3>
        <p className="text-base font-medium text-bgray-600 dark:text-darkblack-300 mb-7">
        Ingresa el correo electrónico asociado a tu cuenta
        </p>

        {error && <p className="text-red-500 mb-3" aria-live="assertive">{error}</p>}

        <form onSubmit={onSubmit}>
          <div className="mb-8">
            <input
              type="email"
              required
              className="rounded-lg bg-[#F5F5F5] dark:bg-darkblack-500 dark:text-white p-4 border-0 focus:border focus:ring-0 focus:border-success-300 w-full placeholder:font-medium text-base h-14"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Link
            to="/signin"
            className="block text-sm font-bold text-success-300 mb-8 underline"
          >
            Volver al inicio de sesión
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full py-4 text-white bg-success-300 hover:bg-success-400 transition-all justify-center text-base font-medium rounded-lg disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

export const CodeVerify = ({ 
  email,
  digits,
  setDigits,
  error,
  loading,
  resending,
  onSubmit,
  onResend,
  onClose
}) => {
  const inputs = useRef([]);

  const handleChange = (index, value) => {
    if (/^\d$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);
      
      if (index < 4) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 5);
    if (/^\d{5}$/.test(paste)) {
      const newDigits = paste.split('');
      setDigits(newDigits);
      inputs.current[4].focus();
    }
  };

  const maskedEmail = email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, '$1***@$2');

  return (
    <div className="step-content step-2">
      <div className="relative max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 p-8 text-left transition-all">
        <CrossBtn close={onClose} />
        <div>
          <HeadingLogo />
          <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
            Ingresa el código de verificación
          </h3>
          <p className="text-base font-medium text-bgray-600 dark:text-darkblack-300 mb-7">
            Enviado a {maskedEmail}
          </p>

          {error && <p className="text-red-500 mb-3" aria-live="assertive">{error}</p>}

          <form onSubmit={onSubmit}>
            <div className="flex space-x-6 mb-8">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  className="px-5 py-3 rounded-xl text-2xl border border-transparent focus:ring-0 focus:border focus:border-success-300 font-bold text-bgray-900 bg-[#F5F5F5] dark:bg-darkblack-500 dark:text-white w-14 h-14 text-center"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onPaste={handlePaste}
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              className="block text-sm font-bold text-success-300 mb-8 disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full py-4 text-white bg-success-300 hover:bg-success-400 transition-all justify-center text-base font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const NewPass = ({ 
  password,
  setPassword,
  confirm,
  setConfirm,
  error,
  loading,
  onSubmit,
  onClose
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="step-content step-3">
      <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 p-8 text-left transition-all">
        <CrossBtn close={onClose} />
        <div>
          <HeadingLogo />
          <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
            Crear nueva contraseña
          </h3>
          <p className="text-base font-medium text-bgray-600 dark:text-darkblack-300 mb-7">
            Ingresa una nueva contraseña a continuación
          </p>

          {error && <p className="text-red-500 mb-3" aria-live="assertive">{error}</p>}

          <form onSubmit={onSubmit}>
            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                className="text-bgray-800 text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-bgray-500 placeholder:text-base dark:text-white dark:bg-darkblack-500 dark:border-0"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-4 right-4 bottom-4"
              >
                {/* Eye icon SVG remains same */}
              </button>
            </div>
            <div className="mb-8 relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="text-bgray-800 text-base border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-bgray-500 placeholder:text-base dark:bg-darkblack-500 dark:border-0"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-4 right-4 bottom-4"
              >
                {/* Eye icon SVG remains same */}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full py-4 text-white bg-success-300 hover:bg-success-400 transition-all justify-center text-base font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Confirm Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const SuccessFull = ({ onClose }) => (
  <div className="step-content step-4">
    <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-darkblack-600 p-8 text-left transition-all">
      <CrossBtn close={onClose} />
      <div className="text-center mt-4">
        <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
          ¡Contraseña actualizada con éxito!
        </h3>
        <p className="text-base font-medium text-bgray-600 dark:text-darkblack-300 mb-7">
          Has restablecido tu contraseña correctamente
        </p>
        <Link
          to="/signin"
          onClick={onClose}
          className="flex w-full py-4 text-white bg-success-300 hover:bg-success-400 transition-all justify-center text-base font-semibold rounded-lg"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  </div>
);

function PasswordResetModal({ isActive, handleActive }) {
  const [step, setStep] = useState('reset');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(Array(5).fill(''));
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const resetState = () => {
    setStep('reset');
    setEmail('');
    setDigits(Array(5).fill(''));
    setPassword('');
    setConfirm('');
    setError('');
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/v1/users/send_recovery_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send code');
      }

      setStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const code = digits.join('');
      const response = await fetch(`${API_URL}/api/v1/users/verify_recovery_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid verification code');
      }

      setStep('newPass');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    
    try {
      await fetch(`${API_URL}/api/v1/users/send_recovery_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (password !== confirm) {
        throw new Error('Las contraseñas no coinciden');
      }
      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error('La contraseña debe contener al menos una letra mayúscula');
      }
      if (!/\d/.test(password)) {
        throw new Error('La contraseña debe contener al menos un número');
      }

      const response = await fetch(`${API_URL}/api/v1/users/update_password_with_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: digits.join(''),
          new_password: password,
          new_password_confirmation: confirm
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password update failed');
      }

      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal fixed inset-0 z-50 overflow-y-auto flex items-center justify-center ${isActive ? '' : 'hidden'}`}>
      <div className="modal-overlay absolute inset-0 bg-gray-500 opacity-75 dark:bg-bgray-900 dark:opacity-50"></div>
      <div className="modal-content w-full max-w-lg mx-auto px-4">
        {step === 'reset' && (
          <ResetPass
            email={email}
            setEmail={setEmail}
            error={error}
            loading={loading}
            onSubmit={handleSendCode}
            onClose={() => {
              handleActive(false);
              resetState();
            }}
          />
        )}

        {step === 'verify' && (
          <CodeVerify
            email={email}
            digits={digits}
            setDigits={setDigits}
            error={error}
            loading={loading}
            resending={resending}
            onSubmit={handleVerifyCode}
            onResend={handleResendCode}
            onClose={() => {
              handleActive(false);
              resetState();
            }}
          />
        )}

        {step === 'newPass' && (
          <NewPass
            password={password}
            setPassword={setPassword}
            confirm={confirm}
            setConfirm={setConfirm}
            error={error}
            loading={loading}
            onSubmit={handleUpdatePassword}
            onClose={() => {
              handleActive(false);
              resetState();
            }}
          />
        )}

        {step === 'success' && (
          <SuccessFull onClose={() => {
            handleActive(false);
            resetState();
          }} />
        )}
      </div>
    </div>
  );
}

PasswordResetModal.propTypes = {
  isActive: ProtoTypes.bool,
  handleActive: ProtoTypes.func,
};

export default PasswordResetModal;