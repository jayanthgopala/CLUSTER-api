import { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "../services/api"; // axios instance with baseURL & interceptors

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);   // true until we check session
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/userdata", { withCredentials: true });
        console.log("fetch user for referesh:",res);
        setUser(res.data.data);
      } catch (err) {
        console.error("Session check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Login function
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await axios.post(
        "/api/login",
        { email, password },
        { withCredentials: true }
      );
      console.log("user:",res.data.user);
      setUser(res.data.user);
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
      return { success: false, error: err };
    }
  }, []);

  // ✅ Logout function
  const logout = useCallback(async () => {
    setError(null);
    console.log("Logging out...");
    try {
      const res = await axios.get("/api/logout", { withCredentials: true });
      console.log("Logout response:", res.data);
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed");
      return { success: false, error: err };
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
