"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { getLoginUrl, logout, type UserRole } from "@/lib/auth";

const ALL_ROLES: UserRole[] = ["ADMIN", "MANDOR", "BURUH", "SUPIR"];

const NAV_LINKS: { href: string; label: string; roles: UserRole[] }[] = [
  { href: "/dashboard", label: "Home", roles: ALL_ROLES },
  { href: "/kebun", label: "Kebun", roles: ["ADMIN", "MANDOR"] },
  { href: "/users", label: "Pengguna", roles: ["ADMIN"] },
  { href: "/assignment", label: "Penempatan Buruh", roles: ["ADMIN"] },
  { href: "/driver-assignment", label: "Penempatan Supir", roles: ["ADMIN"] },
  { href: "/panen", label: "Panen", roles: ["MANDOR", "BURUH"] },
  { href: "/pengiriman", label: "Pengiriman", roles: ["ADMIN", "MANDOR", "SUPIR"] },
  { href: "/payroll", label: "Payroll", roles: ALL_ROLES },
  { href: "/sawitbid", label: "SawitBid", roles: ALL_ROLES },
];

const PUBLIC_LINKS = [
  { href: "#features", label: "Fitur" },
  { href: "#payment", label: "Pembayaran" },
  { href: "/sawitbid", label: "SawitBid" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, isAuthenticated } = useAuth();

  const visibleLinks = NAV_LINKS.filter((link) => role && link.roles.includes(role));

  return (
    <nav
      className={`sticky top-0 z-50 flex min-h-16 items-center justify-between border-b border-[var(--color-border)] bg-white/90 px-6 py-3 backdrop-blur-sm ${
        isAuthenticated ? "lg:ml-[var(--sidebar-width)]" : ""
      }`}
    >
      <Link href="/" className="text-xl font-bold text-[var(--color-primary)]">
        Palmery
      </Link>

      {isAuthenticated ? (
        <div className="hidden md:flex lg:hidden items-center gap-6">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[var(--color-primary)] underline underline-offset-8 decoration-2"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-6">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="hidden sm:inline text-sm text-[var(--color-text-muted)]">
              {user?.name ?? user?.email ?? "User"}
            </span>
            <button
              onClick={logout}
              className="hidden sm:inline-flex rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-border-light)] transition-colors"
            >
              Log Out
            </button>
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold"
            >
              {(user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()}
            </Link>
          </>
        ) : (
          <>
            <a
              href={getLoginUrl()}
              className="hidden sm:inline-flex rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border-light)] transition-colors"
            >
              Masuk
            </a>
            <a
              href={getLoginUrl()}
              className="inline-flex rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
            >
              Daftar Sekarang
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
