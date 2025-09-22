import { Navigate, useLocation, useParams } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const AdminOrOwnerRoute = ({ children }) => {
  const { token, user: currentUser } = useContext(AuthContext);
  const location = useLocation();
  const params = useParams();

  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Allow if current user is admin
  if (currentUser?.role === "admin") return children;

  // Allow if current user is the same as requested user id
  if (params.userId && String(currentUser?.id) === String(params.userId)) return children;

  // If the requested user has a created_by field and matches current user allow
  // Note: we can't fetch the target user here synchronously; components should still guard.
  // This route covers common cases (self or admin). For created_by checks prefer component-level checks.

  return <Navigate to="/projects" replace />;
};

export default AdminOrOwnerRoute;
