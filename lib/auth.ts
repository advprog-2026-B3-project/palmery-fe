export type AppRole = "ADMIN" | "MANDOR" | "SUPIR" | "BURUH";

export type AuthSession = {
  accessToken: string;
  userId: string;
  role: AppRole;
  name: string;
  email: string;
};

const TOKEN_KEY = "access_token";
const USER_ID_KEY = "user_id";
const ROLE_KEY = "role";
const NAME_KEY = "user_name";
const EMAIL_KEY = "user_email";

const AUTH_APP_URL =
  process.env.NEXT_PUBLIC_AUTH_APP_URL ?? "http://localhost:3000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

function base64UrlDecode(value: string): string {
  const padded = value.padEnd(value.length + (4 - (value.length % 4)) % 4, "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(base64);
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function normalizeRole(raw?: string | null): AppRole | null {
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase();
  if (["SUPIR", "DRIVER"].includes(normalized)) return "SUPIR";
  if (["MANDOR", "SUPERVISOR"].includes(normalized)) return "MANDOR";
  if (["ADMIN", "ADMIN_UTAMA"].includes(normalized)) return "ADMIN";
  if (["BURUH", "WORKER", "PEKERJA"].includes(normalized)) return "BURUH";
  if (["ADMIN", "MANDOR", "SUPIR", "BURUH"].includes(normalized)) {
    return normalized as AppRole;
  }
  return null;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== "number") return true;
  return exp * 1000 <= Date.now();
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const token =
    window.localStorage.getItem(TOKEN_KEY) ??
    window.localStorage.getItem("token");
  if (!token || isTokenExpired(token)) return null;

  const payload = decodeJwtPayload(token);
  const userId =
    (typeof payload?.sub === "string" ? payload.sub : null) ??
    window.localStorage.getItem(USER_ID_KEY);
  const role =
    normalizeRole(
      (typeof payload?.role === "string" ? payload.role : null) ??
        window.localStorage.getItem(ROLE_KEY),
    ) ?? null;

  if (!userId || !role) return null;

  return {
    accessToken: token,
    userId,
    role,
    name:
      (typeof payload?.name === "string" ? payload.name : null) ??
      window.localStorage.getItem(NAME_KEY) ??
      "",
    email:
      (typeof payload?.email === "string" ? payload.email : null) ??
      window.localStorage.getItem(EMAIL_KEY) ??
      "",
  };
}

export function setSession(token: string): AuthSession | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const userId = typeof payload.sub === "string" ? payload.sub : null;
  const role = normalizeRole(
    typeof payload.role === "string" ? payload.role : null,
  );
  if (!userId || !role) return null;

  const name = typeof payload.name === "string" ? payload.name : "";
  const email = typeof payload.email === "string" ? payload.email : "";

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_ID_KEY, userId);
  window.localStorage.setItem(ROLE_KEY, role);
  window.localStorage.setItem(NAME_KEY, name);
  window.localStorage.setItem(EMAIL_KEY, email);
  window.localStorage.setItem("palmery-current-user", userId);

  document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=Lax`;

  return { accessToken: token, userId, role, name, email };
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem("token");
  window.localStorage.removeItem(USER_ID_KEY);
  window.localStorage.removeItem("userId");
  window.localStorage.removeItem(ROLE_KEY);
  window.localStorage.removeItem(NAME_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

export function dashboardPathForRole(role: AppRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MANDOR":
      return "/mandor";
    case "SUPIR":
      return "/supir";
    default:
      return "/";
  }
}

export function buildLoginUrl(returnPath?: string): string {
  const callback = new URL("/auth/callback", APP_URL);
  if (returnPath) {
    callback.searchParams.set("next", returnPath);
  }
  const url = new URL("/login", AUTH_APP_URL);
  url.searchParams.set("returnUrl", callback.toString());
  return url.toString();
}

export function buildRegisterUrl(returnPath?: string): string {
  const callback = new URL("/auth/callback", APP_URL);
  if (returnPath) {
    callback.searchParams.set("next", returnPath);
  }
  const url = new URL("/register", AUTH_APP_URL);
  url.searchParams.set("returnUrl", callback.toString());
  return url.toString();
}

export function roleAllowsPath(role: AppRole, pathname: string): boolean {
  if (pathname.startsWith("/admin")) return role === "ADMIN";
  if (pathname.startsWith("/mandor")) return role === "MANDOR";
  if (pathname.startsWith("/supir")) return role === "SUPIR";
  return true;
}

export { AUTH_APP_URL, APP_URL };
