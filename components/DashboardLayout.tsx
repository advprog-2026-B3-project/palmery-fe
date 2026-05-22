"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import AuthGuard from "./AuthGuard";
import { type UserRole } from "@/lib/auth";

type DashboardLayoutProps = {
  children: React.ReactNode;
  /** If specified, only these roles can access the page */
  allowedRoles?: UserRole[];
};

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
        <Navbar />
        <div className="flex flex-1 min-w-0">
          <Sidebar />
          <main className="flex-1 min-w-0 lg:ml-[var(--sidebar-width)]">
            <div className="px-4 py-6 sm:px-6 md:px-8">
              {children}
            </div>
          </main>
        </div>
        <div className="lg:ml-[var(--sidebar-width)]">
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
