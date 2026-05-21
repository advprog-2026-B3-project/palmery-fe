"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import { getHarvests, getMyHarvests, type HarvestResult } from "@/lib/api";

export default function PanenListPage() {
  const { isBuruh, isMandor, isAdmin } = useAuth();
  const [harvests, setHarvests] = useState<HarvestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHarvests();
  }, []);

  async function loadHarvests() {
    setLoading(true);
    setError(null);
    try {
      // Buruh sees own harvests, Mandor/Admin sees all
      const data = isBuruh ? await getMyHarvests() : await getHarvests();
      setHarvests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load harvests");
    } finally {
      setLoading(false);
    }
  }

  function statusBadge(status: string) {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>;
      case "REJECTED":
        return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
      default:
        return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
    }
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN", "MANDOR", "BURUH"]}>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isBuruh ? "Riwayat Hasil Panen" : "Daftar Hasil Panen"}
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              {isBuruh && "Lihat riwayat hasil panen harian Anda."}
              {isMandor && "Lihat dan validasi hasil panen dari Buruh Anda."}
              {isAdmin && "Lihat semua data hasil panen."}
            </p>
          </div>
          {isBuruh && (
            <Link
              href="/panen/tambah"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Hasil
            </Link>
          )}
        </div>

        {loading && <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        {!loading && !error && harvests.length === 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
            <p className="text-[var(--color-text-muted)]">Belum ada data panen.</p>
            {isBuruh && (
              <Link
                href="/panen/tambah"
                className="inline-flex mt-4 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
              >
                Catat Panen Pertama
              </Link>
            )}
          </div>
        )}

        {!loading && harvests.length > 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Berat (Kg)</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Catatan</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {harvests.map((h) => (
                  <tr key={h.id} className="border-b border-[var(--color-border-light)] last:border-0">
                    <td className="px-4 py-3">{h.harvestDate}</td>
                    <td className="px-4 py-3 font-medium">{h.kgHarvested} kg</td>
                    <td className="px-4 py-3">{statusBadge(h.status)}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] max-w-[200px] truncate">
                      {h.status === "REJECTED" && h.rejectionReason ? (
                        <span className="text-red-600">{h.rejectionReason}</span>
                      ) : (
                        h.notes
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/panen/${h.id}`} className="text-[var(--color-primary)] hover:underline text-sm">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
