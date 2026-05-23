const AUTH_FRONTEND_URL = process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL
  ?? process.env.NEXT_PUBLIC_AUTH_APP_URL
  ?? "http://localhost:3000";
const APP_CALLBACK_URL = process.env.NEXT_PUBLIC_APP_CALLBACK_URL ?? "http://localhost:3001/auth/callback";

export type UserRole = "ADMIN" | "MANDOR" | "BURUH" | "SUPIR";

export type AuthUser = {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
  exp: number;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_access_token");
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_access_token", token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_access_token");
}

export function decodeToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const padded = parts[1].padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, "=");
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (!payload.sub || !payload.exp) return null;
    return payload as AuthUser;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  return payload.exp * 1000 <= Date.now();
}

export function getAuthUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearToken();
    return null;
  }
  return decodeToken(token);
}

/**
 * Normalize role from JWT to standard role names.
 * The JWT contains MAPPED roles from ManageRoleMapper:
 *   ADMIN → ADMIN
 *   SUPERVISOR → MANDOR
 *   WORKER → BURUH
 *   DRIVER → SUPIR
 */
export function normalizeRole(role?: string): UserRole | null {
  if (!role) return null;
  const upper = role.toUpperCase().trim();
  if (["ADMIN", "ADMIN_UTAMA"].includes(upper)) return "ADMIN";
  if (["SUPERVISOR", "MANDOR"].includes(upper)) return "MANDOR";
  if (["WORKER", "BURUH", "PEKERJA"].includes(upper)) return "BURUH";
  if (["DRIVER", "SUPIR"].includes(upper)) return "SUPIR";
  return null;
}

export function getUserRole(): UserRole | null {
  const user = getAuthUser();
  return normalizeRole(user?.role);
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export function hasRole(allowedRoles: UserRole[]): boolean {
  const role = getUserRole();
  if (!role) return false;
  return allowedRoles.includes(role);
}

export function getLoginUrl(): string {
  return `${AUTH_FRONTEND_URL}/login?returnUrl=${encodeURIComponent(APP_CALLBACK_URL)}&force=login`;
}

export function getRegisterUrl(): string {
  return `${AUTH_FRONTEND_URL}/register?returnUrl=${encodeURIComponent(APP_CALLBACK_URL)}`;
}

export function logout(): void {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

/**
 * Role display names in Indonesian
 */
export function getRoleDisplayName(role?: string): string {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "ADMIN": return "Admin Utama";
    case "MANDOR": return "Mandor";
    case "BURUH": return "Buruh";
    case "SUPIR": return "Supir";
    default: return role ?? "Unknown";
  }
}
