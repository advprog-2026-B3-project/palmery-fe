"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getPengirimanBySupirForMandor,
  getUsersByIds,
  type Pengiriman,
  type UserSummary,
} from "@/lib/api";

export default function SupirProfilePage() {
  const params = useParams();
  const supirId = params.id as string;

  const [supir, setSupir] = useState<UserSummary | null>(null);
  const [pengirimanList, setPengirimanList] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    void load();
  }, [supirId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [profiles, list] = await Promise.all([
        getUsersByIds([supirId]).catch(() => []),
        getPengirimanBySupirForMandor(supirId, {
          from: filterFrom || undefined,
          to: filterTo || undefined,
        }),
      ]);
      setSupir(profiles[0] ?? null);
      setPengirimanList(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data supir");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = pengirimanList.length;
    const arrived = pengirimanList.filter((p) => p.status === "TIBA_DI_TUJUAN").length;
    const totalKg = pengirimanList.reduce((sum, p) => sum + (p.total_kg ?? 0), 0);
    return { total, arrived, totalKg };
  }, [pengirimanList]);

  function statusBadge(status: string) {
    const lower = status.toUpperCase();
    if (lower === "TIBA_DI_TUJUAN") {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Tiba</span>;
    }
    if (lower === "MENGIRIM") {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Mengirim</span>;
    }
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Memuat</span>;
  }

  return (
    <DashboardLayout allowedRoles={["MANDOR", "ADMIN"]}>
      <div className="max-w-5xl">
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/pengiriman" className="hover:text-[var(--color-primary)]">Pengiriman</Link>
          <span className="mx-2">›</span>
          <span>Profil Supir</span>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-xl font-bold text-[var(--color-primary)]">
            {(supir?.nama ?? "S").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold truncate">
              {supir?.nama ?? `Supir #${supirId.slice(0, 8)}`}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] truncate">{supir?.email ?? supirId}</p>
          </div>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-border-light)]">
            SUPIR
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <Stat label="Total Pengiriman" value={stats.total.toString()} />
          <Stat label="Sudah Tiba" value={stats.arrived.toString()} />
          <Stat label="Total Kg Terangkut" value={`${stats.totalKg} kg`} />
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={load}
                className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]"
              >
                Terapkan
              </button>
              <button
                onClick={() => {
                  setFilterFrom("");
                  setFilterTo("");
                  setTimeout(load, 0);
                }}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>}

        {!loading && pengirimanList.length === 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">
            Tidak ada pengiriman pada rentang tanggal tersebut.
          </div>
        )}

        {!loading && pengirimanList.length > 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Berat</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Approval Mandor</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Approval Admin</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pengirimanList.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-border-light)] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">#{p.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3 font-medium">{p.total_kg} kg</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                      {p.mandor_approval_status?.replace(/_/g, " ") ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                      {p.admin_approval_status?.replace(/_/g, " ") ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/pengiriman/${p.id}`} className="text-[var(--color-primary)] hover:underline">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
