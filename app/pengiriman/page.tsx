"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import {
  getActivePengirimanMandor,
  getActivePengirimanSupir,
  getPendingPengiriman,
  getRiwayatPengirimanSupir,
  type Pengiriman,
} from "@/lib/api";

export default function PengirimanListPage() {
  const { initialized, isAdmin, isMandor, isSupir } = useAuth();
  const [pengiriman, setPengiriman] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");

  useEffect(() => {
    if (!initialized) {
      return;
    }
    void loadPengiriman();
  }, [initialized, isAdmin, isMandor, isSupir]);

  async function loadPengiriman(options?: { history?: boolean; from?: string; to?: string }) {
    setLoading(true);
    setError(null);
    try {
      const useHistory = options?.history ?? false;
      const from = options?.from ?? historyFrom;
      const to = options?.to ?? historyTo;
      const data = isAdmin
        ? await getPendingPengiriman()
        : isSupir
          ? useHistory && from && to
            ? await getRiwayatPengirimanSupir(from, to)
            : await getActivePengirimanSupir()
          : await getActivePengirimanMandor();
      setPengiriman(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pengiriman");
    } finally {
      setLoading(false);
    }
  }

  function deliveryBadge(status: string) {
    const colors: Record<string, string> = {
      MEMUAT: "bg-blue-100 text-blue-700",
      MENGIRIM: "bg-yellow-100 text-yellow-700",
      TIBA_DI_TUJUAN: "bg-green-100 text-green-700",
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-700"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  }

  function approvalBadge(status: string) {
    const colors: Record<string, string> = {
      PENDING: "bg-gray-100 text-gray-600",
      APPROVED: "bg-green-100 text-green-700",
      PARTIALLY_APPROVED: "bg-yellow-100 text-yellow-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-700"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN", "MANDOR", "SUPIR"]}>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manajemen Pengiriman</h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              {isAdmin && "Validasi pengiriman yang telah disetujui Mandor."}
              {isMandor && "Kelola logistik pengiriman hasil panen ke pabrik."}
              {isSupir && "Lihat dan update status pengiriman Anda."}
            </p>
          </div>
          {isMandor && (
            <Link
              href="/pengiriman/tambah"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Pengiriman
            </Link>
          )}
        </div>

        {isSupir && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={historyFrom}
                  onChange={(e) => setHistoryFrom(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={historyTo}
                  onChange={(e) => setHistoryTo(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end gap-2 md:col-span-2">
                <button
                  onClick={() => {
                    if (!historyFrom || !historyTo) {
                      setError("Pilih tanggal mulai dan tanggal akhir untuk melihat riwayat.");
                      return;
                    }
                    loadPengiriman({ history: true, from: historyFrom, to: historyTo });
                  }}
                  className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
                >
                  Riwayat
                </button>
                <button
                  onClick={() => {
                    setHistoryFrom("");
                    setHistoryTo("");
                    loadPengiriman({ history: false });
                  }}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)]"
                >
                  Aktif
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        {!loading && !error && pengiriman.length === 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
            <p className="text-[var(--color-text-muted)]">Belum ada pengiriman.</p>
          </div>
        )}

        {!loading && pengiriman.length > 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Total Kg</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Status Kirim</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Mandor</th>
                  {isAdmin && <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Admin</th>}
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pengiriman.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-border-light)] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">#{p.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-medium">{p.total_kg} kg</td>
                    <td className="px-4 py-3">{deliveryBadge(p.status)}</td>
                    <td className="px-4 py-3">{approvalBadge(p.mandor_approval_status ?? "PENDING")}</td>
                    {isAdmin && <td className="px-4 py-3">{approvalBadge(p.admin_approval_status ?? "PENDING")}</td>}
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {new Date(p.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <Link href={`/pengiriman/${p.id}`} className="text-[var(--color-primary)] hover:underline text-sm">
                        Detail
                      </Link>
                      {isMandor && p.supir_id && (
                        <Link
                          href={`/pengiriman/supir/${p.supir_id}`}
                          className="text-[var(--color-text-muted)] hover:underline text-sm"
                        >
                          Profil Supir
                        </Link>
                      )}
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
