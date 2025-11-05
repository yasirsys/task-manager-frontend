import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
