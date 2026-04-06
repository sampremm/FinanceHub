import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role) {
    const roleHierarchy = { VIEWER: 1, ANALYST: 2, ADMIN: 3 };
    if (roleHierarchy[user?.role] < roleHierarchy[role]) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
}