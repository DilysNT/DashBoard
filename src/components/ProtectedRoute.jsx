import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children, requiredRole, fallbackPath = "/" }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login page, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // User doesn't have the required role, redirect to fallback
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
  fallbackPath: PropTypes.string,
};

export default ProtectedRoute; 