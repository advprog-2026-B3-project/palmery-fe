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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 lg:ml-[var(--sidebar-width)] p-6 md:p-8">
            {children}
          </main>
        </div>
        <div className="lg:ml-[var(--sidebar-width)]">
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
