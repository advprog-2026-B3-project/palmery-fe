import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/supir", "/mandor", "/admin"];

function decodePayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeRole(raw?: unknown): string | null {
  if (typeof raw !== "string") return null;
  const role = raw.toUpperCase();
  if (role === "DRIVER") return "SUPIR";
  if (role === "SUPERVISOR") return "MANDOR";
  if (role === "WORKER") return "BURUH";
  if (["ADMIN", "MANDOR", "SUPIR", "BURUH"].includes(role)) return role;
  return null;
}

function roleForPath(pathname: string): string | null {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/mandor")) return "MANDOR";
  if (pathname.startsWith("/supir")) return "SUPIR";
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    const login = new URL("/", request.url);
    login.searchParams.set("login", "required");
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  const payload = decodePayload(token);
  const exp = payload?.exp;
  if (typeof exp === "number" && exp * 1000 <= Date.now()) {
    const login = new URL("/", request.url);
    login.searchParams.set("login", "expired");
    return NextResponse.redirect(login);
  }

  const role = normalizeRole(payload?.role);
  const required = roleForPath(pathname);
  if (!role || !required || role !== required) {
    const home = new URL("/", request.url);
    home.searchParams.set("error", "forbidden");
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/supir/:path*", "/mandor/:path*", "/admin/:path*"],
};
