"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { getLoginUrl, type UserRole } from "@/lib/auth";

type AuthGuardProps = {
  children: React.ReactNode;
  /** If specified, only these roles can access the page */
  allowedRoles?: UserRole[];
};

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { initialized, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [initialized, isAuthenticated]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-[var(--color-text-muted)]">Redirecting to login...</p>
      </div>
    );
  }

  // Role check
  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-6">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-2">Akses Ditolak</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya dapat diakses oleh: {allowedRoles.join(", ")}.
          </p>
          <a
            href="/dashboard"
            className="inline-flex rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
