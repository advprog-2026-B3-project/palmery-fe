"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import {
  getHarvests,
  getMyHarvests,
  getUsersByIds,
  hasSubmittedHarvestToday,
  type HarvestResult,
  type UserSummary,
} from "@/lib/api";

export default function PanenListPage() {
  const { initialized, isBuruh, isMandor } = useAuth();
  const [harvests, setHarvests] = useState<HarvestResult[]>([]);
  const [workers, setWorkers] = useState<Map<string, UserSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedToday, setSubmittedToday] = useState(false);

  // Filters
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterWorkerSearch, setFilterWorkerSearch] = useState("");

  useEffect(() => {
    if (initialized) {
      void loadHarvests();
    }
  }, [initialized, isBuruh, isMandor]);

  async function loadHarvests() {
    setLoading(true);
    setError(null);
    try {
      let data: HarvestResult[];
      if (isBuruh) {
        data = await getMyHarvests({
          start: filterStart || undefined,
          end: filterEnd || undefined,
          status: filterStatus || undefined,
        });
        setHarvests(data);
        setSubmittedToday(await hasSubmittedHarvestToday().catch(() => false));
      } else if (isMandor) {
        data = await getHarvests(filterDate || undefined);
        setHarvests(data);
        // Fetch worker profiles for nama search
        const ids = Array.from(new Set(data.map((h) => h.workerId)));
        if (ids.length > 0) {
          const profiles = await getUsersByIds(ids).catch(() => []);
          const map = new Map<string, UserSummary>();
          profiles.forEach((p) => map.set(p.id, p));
          setWorkers(map);
        }
      } else {
        data = await getHarvests();
        setHarvests(data);
      }
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

  const filteredHarvests = useMemo(() => {
    if (!isMandor || !filterWorkerSearch.trim()) return harvests;
    const needle = filterWorkerSearch.trim().toLowerCase();
    return harvests.filter((h) => {
      const profile = workers.get(h.workerId);
      const haystack = [profile?.nama, profile?.email, h.workerId].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [harvests, workers, isMandor, filterWorkerSearch]);

  return (
    <DashboardLayout allowedRoles={["MANDOR", "BURUH"]}>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isBuruh ? "Riwayat Hasil Panen" : "Daftar Hasil Panen"}
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              {isBuruh && "Lihat riwayat hasil panen harian Anda."}
              {isMandor && "Lihat dan validasi hasil panen dari Buruh Anda."}
            </p>
          </div>
          {isBuruh && (
            submittedToday ? (
              <span
                title="Hasil panen hari ini sudah dicatat. Coba lagi besok."
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-border-light)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-muted)] cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Sudah Dicatat Hari Ini
              </span>
            ) : (
              <Link
                href="/panen/tambah"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah Hasil
              </Link>
            )
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 mb-4">
          {isBuruh ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={filterEnd}
                  onChange={(e) => setFilterEnd(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white"
                >
                  <option value="">Semua</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={loadHarvests}
                  className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
                >
                  Terapkan
                </button>
                <button
                  onClick={() => {
                    setFilterStart("");
                    setFilterEnd("");
                    setFilterStatus("");
                    setTimeout(loadHarvests, 0);
                  }}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)]"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tanggal Panen</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  onBlur={loadHarvests}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Cari Nama Buruh</label>
                <input
                  type="text"
                  value={filterWorkerSearch}
                  onChange={(e) => setFilterWorkerSearch(e.target.value)}
                  placeholder="Ketik nama atau email..."
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={loadHarvests}
                  className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
                >
                  Terapkan
                </button>
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterWorkerSearch("");
                    setTimeout(loadHarvests, 0);
                  }}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)]"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        {!loading && !error && filteredHarvests.length === 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
            <p className="text-[var(--color-text-muted)]">Belum ada data panen.</p>
            {isBuruh && !submittedToday && (
              <Link
                href="/panen/tambah"
                className="inline-flex mt-4 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
              >
                Catat Panen Pertama
              </Link>
            )}
          </div>
        )}

        {!loading && filteredHarvests.length > 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Tanggal</th>
                  {isMandor && (
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Buruh</th>
                  )}
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Berat (Kg)</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Catatan</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredHarvests.map((h) => (
                  <tr key={h.id} className="border-b border-[var(--color-border-light)] last:border-0">
                    <td className="px-4 py-3">{h.harvestDate}</td>
                    {isMandor && (
                      <td className="px-4 py-3">
                        {workers.get(h.workerId)?.nama ?? `#${h.workerId.slice(0, 8)}`}
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium">{h.kgHarvested} kg</td>
                    <td className="px-4 py-3">{statusBadge(h.status)}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] max-w-[200px] truncate">
                      {h.status === "REJECTED" && h.rejectionReason ? (
                        <span className="text-red-600">{h.rejectionReason}</span>
                      ) : (
                        h.notes
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <Link href={`/panen/${h.id}`} className="text-[var(--color-primary)] hover:underline text-sm">
                        Detail
                      </Link>
                      {isMandor && (
                        <Link href={`/panen/buruh/${h.workerId}`} className="text-[var(--color-text-muted)] hover:underline text-sm">
                          Profil Buruh
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
