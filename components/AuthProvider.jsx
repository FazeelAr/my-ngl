"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { clearToken, getToken, setToken as persistToken } from "@/lib/token-store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const storedToken = getToken();
      if (!storedToken) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        const payload = await api.verifyToken(storedToken);
        if (!cancelled && payload?.user_id) {
          setToken(storedToken);
          setUser({
            id: payload.user_id,
            email: payload.email,
          });
        }
      } catch {
        clearToken();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (newToken, userData) => {
    persistToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
