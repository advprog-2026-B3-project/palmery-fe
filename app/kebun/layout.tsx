"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function KebunLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isListPage = pathname === "/kebun";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sub-header with back button (only on non-list pages) */}
      {!isListPage && (
        <div className="px-6 pt-4">
          <Link
            href="/kebun"
            className="inline-flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
          >
            &larr; Kembali
          </Link>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
}
