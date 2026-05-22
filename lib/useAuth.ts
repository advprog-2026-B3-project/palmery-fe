"use client";

import { useEffect, useState } from "react";
import { getAuthUser, getToken, isTokenExpired, clearToken, normalizeRole, type AuthUser, type UserRole } from "./auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = getToken();
    const nextUser = token && !isTokenExpired(token) ? getAuthUser() : null;
    if (token && !isTokenExpired(token)) {
      queueMicrotask(() => {
        setUser(nextUser);
        setInitialized(true);
      });
    } else {
      if (token) {
        clearToken();
      }
      queueMicrotask(() => {
        setUser(null);
        setInitialized(true);
      });
    }
  }, []);

  const role: UserRole | null = normalizeRole(user?.role);

  return {
    user,
    role,
    initialized,
    isAuthenticated: user !== null,
    isAdmin: role === "ADMIN",
    isMandor: role === "MANDOR",
    isBuruh: role === "BURUH",
    isSupir: role === "SUPIR",
  };
}
