import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: ("EMPLOYEE" | "MANAGER")[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "MANAGER" ? "/manager/dashboard" : "/employee/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};