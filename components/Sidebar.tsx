"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { getRoleDisplayName, type UserRole } from "@/lib/auth";

type SidebarLink = {
  href: string;
  label: string;
  roles: UserRole[]; // which roles can see this link
  icon: React.ReactNode;
};

const ALL_ROLES: UserRole[] = ["ADMIN", "MANDOR", "BURUH", "SUPIR"];

const SIDEBAR_LINKS: SidebarLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ALL_ROLES,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/kebun",
    label: "Kebun",
    roles: ["ADMIN", "MANDOR"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
      </svg>
    ),
  },
  {
    href: "/panen",
    label: "Panen",
    roles: ["ADMIN", "MANDOR", "BURUH"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12V2"/><path d="M12 2a14.5 14.5 0 0 1 0 20"/><path d="M22 12H12"/>
      </svg>
    ),
  },
  {
    href: "/pengiriman",
    label: "Pengiriman",
    roles: ["ADMIN", "MANDOR", "SUPIR"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.684-.948V8a1 1 0 0 1 1-1h1.382a1 1 0 0 1 .894.553l1.448 2.894A1 1 0 0 0 20.382 11H22a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1"/><circle cx="7" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>
      </svg>
    ),
  },
  {
    href: "/payroll",
    label: "Payroll",
    roles: ALL_ROLES,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const visibleLinks = SIDEBAR_LINKS.filter(
    (link) => !role || link.roles.includes(role)
  );

  return (
    <aside className="hidden lg:flex flex-col w-[var(--sidebar-width)] min-h-screen border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] py-6 px-4 fixed left-0 top-0">
      {/* Brand */}
      <div className="mb-8 px-2">
        <h2 className="text-sm font-bold text-[var(--color-primary)]">Palmery Management</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          {role ? getRoleDisplayName(role) : "Enterprise Field Portal"}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1">
        {visibleLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-border-light)] hover:text-[var(--color-text)]"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[var(--color-border)]">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-[var(--color-text)] truncate">{user.name ?? user.email}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{getRoleDisplayName(role ?? undefined)}</p>
          </div>
        )}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border-light)] w-full text-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Bantuan
        </button>
      </div>
    </aside>
  );
}
