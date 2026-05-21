"use client";

import Link from "next/link";

export default function KebunLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-olive-700 text-sm font-bold text-white"
               style={{ backgroundColor: "#4a5c3a" }}>
            P
          </div>
          <span className="text-lg font-semibold text-gray-800">Palmery</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/kebun" className="text-sm font-medium text-olive-700" style={{ color: "#4a5c3a" }}>
            Kebun
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-700">
              A
            </div>
            <span className="text-sm text-gray-600">Admin</span>
          </div>
        </div>
      </nav>

      {/* Back button area */}
      <div className="px-6 pt-4">
        <Link
          href="/kebun"
          className="inline-flex items-center rounded-md bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600"
        >
          &larr; Kembali
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
}
