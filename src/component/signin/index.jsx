import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import PasswordResetModal from "../modal/PasswordResetModal";
import LeftSide from "./LeftSide";

function SignIn() {
  const [modalOpen, setModalOpen] = useState(false);

  // Only auto-fill admin credentials during local development or staging.
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isDevOrStaging =
    (typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production") ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes("staging");

  const [email, setEmail] = useState(() => (isDevOrStaging ? "admin@example.com" : ""));
  const [password, setPassword] = useState(() => (isDevOrStaging ? "superPassword@123" : ""));
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
      else if(user.role === 'seller')
        navigate("/contracts");
      else {
        navigate(`/balance/user/${user.id}`);
      }
    }
    // If not success, error is handled by apiError from context
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftSide
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        errors={errors}
        handleSubmit={handleSubmit}
        loading={loading}
        apiError={apiError}
        setModalOpen={setModalOpen}
      />
      <PasswordResetModal
        isActive={modalOpen}
        handleActive={setModalOpen}
      />
    </div>
  );
}

SignIn.propTypes = {};

export default SignIn;