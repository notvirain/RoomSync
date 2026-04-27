import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("roomsync_token") || "");
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("roomsync_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      localStorage.removeItem("roomsync_user");
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 && token) {
          setToken("");
          setUser(null);
          setError("Session expired. Please login again.");
          localStorage.removeItem("roomsync_token");
          localStorage.removeItem("roomsync_user");
          setAuthToken("");
          navigate("/login", { replace: true });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [token, navigate]);

  const login = async (email, password) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: nextToken, user: nextUser } = response.data;

      setToken(nextToken);
      setUser(nextUser);

      localStorage.setItem("roomsync_token", nextToken);
      localStorage.setItem("roomsync_user", JSON.stringify(nextUser));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, username, password) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", { name, email, username, password });
      const { token: nextToken, user: nextUser } = response.data;

      setToken(nextToken);
      setUser(nextUser);

      localStorage.setItem("roomsync_token", nextToken);
      localStorage.setItem("roomsync_user", JSON.stringify(nextUser));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setError("");
    localStorage.removeItem("roomsync_token");
    localStorage.removeItem("roomsync_user");
    setAuthToken("");
    navigate("/login");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      setError,
      login,
      register,
      logout,
    }),
    [token, user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
