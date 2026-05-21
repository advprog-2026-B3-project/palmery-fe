"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getPlantations, type PlantationSummary } from "@/lib/api";

export default function KebunListPage() {
  const [plantations, setPlantations] = useState<PlantationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlantations();
  }, []);

  async function loadPlantations() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlantations();
      setPlantations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plantations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN", "MANDOR"]}>
      <div className="max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/kebun" className="hover:text-[var(--color-primary)]">Kebun</Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Daftar Kebun</h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              Kelola semua aset lahan perkebunan sawit Anda.
            </p>
          </div>
          <Link
            href="/kebun/tambah"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Kebun
          </Link>
        </div>

        {loading && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && plantations.length === 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
            <p className="text-[var(--color-text-muted)]">Belum ada kebun terdaftar.</p>
            <Link
              href="/kebun/tambah"
              className="inline-flex mt-4 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
            >
              Tambah Kebun Pertama
            </Link>
          </div>
        )}

        {!loading && plantations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plantations.map((p) => (
              <Link
                key={p.id}
                href={`/kebun/${p.id}`}
                className="bg-white rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] font-mono mb-2">{p.code}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Luas: <span className="font-medium text-[var(--color-text)]">{p.areaHa} Ha</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
