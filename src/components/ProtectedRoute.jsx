import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({children}) {
  const { user, loading } = useAuth();
  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - Loading:", loading);

  if (loading) { // <-- This check might not be hit when it needs to be
    console.log("ProtectedRoute - Waiting for authentication check...");
    return <div>Loading...</div>;
  }

  return user ? <Outlet/> : <Navigate to="/login" />;
};