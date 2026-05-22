"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getHarvestsByWorkerId,
  getUsersByIds,
  type HarvestResult,
  type UserSummary,
} from "@/lib/api";

export default function BuruhProfilePage() {
  const params = useParams();
  const workerId = params.workerId as string;

  const [harvests, setHarvests] = useState<HarvestResult[]>([]);
  const [worker, setWorker] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  useEffect(() => {
    void loadProfile();
  }, [workerId]);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const [harvestData, profiles] = await Promise.all([
        getHarvestsByWorkerId(workerId),
        getUsersByIds([workerId]).catch(() => []),
      ]);
      setHarvests(harvestData);
      setWorker(profiles[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return harvests.filter((h) => {
      if (filterStatus && h.status !== filterStatus) return false;
      if (filterDate && h.harvestDate !== filterDate) return false;
      if (filterStart && h.harvestDate < filterStart) return false;
      if (filterEnd && h.harvestDate > filterEnd) return false;
      return true;
    });
  }, [harvests, filterStatus, filterDate, filterStart, filterEnd]);

  const stats = useMemo(() => ({
    total: harvests.length,
    approved: harvests.filter((h) => h.status === "APPROVED").length,
    pending: harvests.filter((h) => h.status === "PENDING").length,
    rejected: harvests.filter((h) => h.status === "REJECTED").length,
    totalKg: harvests
      .filter((h) => h.status === "APPROVED")
      .reduce((sum, h) => sum + (h.kgHarvested ?? 0), 0),
  }), [harvests]);

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
    <DashboardLayout allowedRoles={["MANDOR", "ADMIN"]}>
      <div className="max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/panen" className="hover:text-[var(--color-primary)]">Panen</Link>
          <span className="mx-2">›</span>
          <span>Profil Buruh</span>
        </div>

        {/* Profile header */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-xl font-bold text-[var(--color-primary)]">
            {(worker?.nama ?? "B").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold truncate">{worker?.nama ?? `Buruh #${workerId.slice(0, 8)}`}</h1>
            <p className="text-sm text-[var(--color-text-muted)] truncate">{worker?.email ?? workerId}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">Total Lapor</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">Approved</p>
            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">Rejected</p>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">Total Kg (Approved)</p>
            <p className="text-2xl font-bold">{stats.totalKg}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tanggal Tertentu</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Mulai</label>
              <input
                type="date"
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Akhir</label>
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
          </div>
        </div>

        {loading && <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">
            Tidak ada data sesuai filter.
          </div>
        )}

        {!loading && filtered.length > 0 && (
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
                {filtered.map((h) => (
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
                      <Link href={`/panen/${h.id}`} className="text-[var(--color-primary)] hover:underline">
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
