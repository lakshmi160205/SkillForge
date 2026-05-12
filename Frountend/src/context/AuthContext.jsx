import { createContext, useContext, useMemo, useState } from "react";
import { api, setAuthToken } from "../services/api.js";

const AuthContext = createContext(null);

const initialUser = JSON.parse(localStorage.getItem("user") || "null");
const initialToken = localStorage.getItem("token") || "";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);

    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setAuthToken(nextToken);
    } else {
      localStorage.removeItem("token");
      setAuthToken("");
    }

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const { data } = await api.login(credentials);
      saveSession(data.token, data.payload);
      return data.payload;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    try {
      const { data } = await api.register(payload);
      return data.payload;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      saveSession("", null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role || "",
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
