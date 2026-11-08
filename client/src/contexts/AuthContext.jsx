import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const rawBackendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "");

// API client configured with credentials
export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("xchat_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Check auth status on initial load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/users/me");
        if (res.data?.success && res.data?.data) {
          setUser(res.data.data);
          localStorage.setItem("xchat_user", JSON.stringify(res.data.data));
        } else {
          setUser(null);
          localStorage.removeItem("xchat_user");
        }
      } catch {
        setUser(null);
        localStorage.removeItem("xchat_user");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // Register action
  const register = async (fullName, username, email, password) => {
    const res = await api.post("/api/users/register", {
      fullName,
      username,
      email,
      password,
    });
    return res.data;
  };

  // Login action
  const login = async (email, password) => {
    const res = await api.post("/api/users/login", { email, password });
    if (res.data?.success && res.data?.data?.user) {
      setUser(res.data.data.user);
      localStorage.setItem("xchat_user", JSON.stringify(res.data.data.user));
    }
    return res.data;
  };

  // Logout action
  const logout = async () => {
    try {
      await api.get("/api/users/logout");
    } catch {
      // Continue cleanup on failure
    } finally {
      setUser(null);
      localStorage.removeItem("xchat_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

