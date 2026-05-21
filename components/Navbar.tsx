"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { getLoginUrl, logout, type UserRole } from "@/lib/auth";

const ALL_ROLES: UserRole[] = ["ADMIN", "MANDOR", "BURUH", "SUPIR"];

const NAV_LINKS: { href: string; label: string; roles: UserRole[] }[] = [
  { href: "/dashboard", label: "Home", roles: ALL_ROLES },
  { href: "/kebun", label: "Kebun", roles: ["ADMIN", "MANDOR"] },
  { href: "/panen", label: "Panen", roles: ["ADMIN", "MANDOR", "BURUH"] },
  { href: "/pengiriman", label: "Pengiriman", roles: ["ADMIN", "MANDOR", "SUPIR"] },
  { href: "/payroll", label: "Payroll", roles: ALL_ROLES },
  { href: "/sawitbid", label: "SawitBid", roles: ALL_ROLES },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, isAuthenticated } = useAuth();

  const visibleLinks = NAV_LINKS.filter(
    (link) => !role || link.roles.includes(role)
  );

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--color-border)] bg-white/90 backdrop-blur-sm px-6 py-3">
      <Link href="/" className="text-xl font-bold text-[var(--color-primary)]">
        Palmery
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {visibleLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
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
              className="hidden sm:inline-flex rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
            >
              Join Today
            </a>
            <a
              href={getLoginUrl()}
              className="w-9 h-9 rounded-full bg-[var(--color-border-light)] flex items-center justify-center text-[var(--color-text-muted)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
