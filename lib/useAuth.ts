"use client";

import { useEffect, useState } from "react";
import { getAuthUser, getToken, isTokenExpired, clearToken, normalizeRole, type AuthUser, type UserRole } from "./auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      setUser(getAuthUser());
    } else if (token) {
      clearToken();
    }
    setInitialized(true);
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
