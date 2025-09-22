import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!user || user.role !== 'admin') {
    // Redirect non-admin users to projects list (or could show 403)
    return <Navigate to="/projects" replace />;
  }

  return children;
};

export default AdminRoute;
