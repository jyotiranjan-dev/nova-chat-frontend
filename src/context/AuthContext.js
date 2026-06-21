"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken, setOnTokenRefreshed, extractErrorMessage } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(null);

  const applySession = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setTokenState(nextToken);
    setAccessToken(nextToken);
  }, []);

  useEffect(() => {
    setOnTokenRefreshed((nextUser, nextToken) => {
      if (!nextToken) {
        applySession(null, null);
      } else {
        setTokenState(nextToken);
        setAccessToken(nextToken);
        if (nextUser) setUser(nextUser);
      }
    });
  }, [applySession]);

  // On mount, try to silently refresh using the httpOnly cookie
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        applySession(data.user, data.accessToken);
      } catch {
        applySession(null, null);
      } finally {
        setLoading(false);
      }
    })();
  }, [applySession]);

  const login = useCallback(
    async (username, password) => {
      try {
        const { data } = await api.post("/auth/login", { username, password });
        applySession(data.user, data.accessToken);
        return { success: true };
      } catch (err) {
        return { success: false, error: extractErrorMessage(err, "Login failed") };
      }
    },
    [applySession]
  );

  const signup = useCallback(
    async (username, displayName, password) => {
      try {
        const { data } = await api.post("/auth/signup", { username, displayName, password });
        applySession(data.user, data.accessToken);
        return { success: true };
      } catch (err) {
        return { success: false, error: extractErrorMessage(err, "Sign up failed") };
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    applySession(null, null);
  }, [applySession]);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
