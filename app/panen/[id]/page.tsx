"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getHarvestById, type HarvestResult } from "@/lib/api";

export default function PanenDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [harvest, setHarvest] = useState<HarvestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHarvest();
  }, [id]);

  async function loadHarvest() {
    setLoading(true);
    setError(null);
    try {
      const data = await getHarvestById(id);
      setHarvest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load harvest");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["ADMIN", "MANDOR", "BURUH"]}>
        <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error || !harvest) {
    return (
      <DashboardLayout allowedRoles={["ADMIN", "MANDOR", "BURUH"]}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error || "Harvest not found"}
        </div>
      </DashboardLayout>
    );
  }

  function statusColor(status: string) {
    switch (status.toUpperCase()) {
      case "APPROVED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN", "MANDOR", "BURUH"]}>
      <div className="max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/panen" className="hover:text-[var(--color-primary)]">Panen</Link>
          <span className="mx-2">›</span>
          <span>Detail Panen #{id.slice(0, 8)}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Detail Hasil Panen</h1>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print Label
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share Report
            </button>
          </div>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Worker Info */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-lg font-bold text-[var(--color-primary)]">
                B
              </div>
              <div>
                <p className="font-semibold text-sm">Buruh</p>
                <p className="text-xs text-[var(--color-text-muted)]">ID: {harvest.workerId.slice(0, 8)}</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
              <div>
                <p className="font-medium text-[var(--color-text)]">Blok Lahan</p>
                <p>Section B-04</p>
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">Shift Kerja</p>
                <p>06:00 - 14:00</p>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Verified Field Worker
            </div>
          </div>

          {/* Total Berat */}
          <div className="bg-[var(--color-accent)] rounded-xl p-5 text-white">
            <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Total Berat Panen</p>
            <p className="text-4xl font-bold">{harvest.kgHarvested}<span className="text-lg ml-1">kg</span></p>
            <p className="text-xs text-white/70 mt-2">+12% from avg yield</p>
          </div>

          {/* Tanggal & Waktu */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Tanggal Input</p>
            <p className="font-semibold">{harvest.harvestDate}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-3 mb-1">Waktu Selesai</p>
            <p className="font-semibold">{harvest.createdAt ? new Date(harvest.createdAt).toLocaleTimeString("id-ID") : "-"}</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Status:</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusColor(harvest.status)}`}>
              {harvest.status}
            </span>
          </div>
        </div>

        {/* Photo & Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Photo */}
          <div className="md:col-span-2 bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Foto Bukti Lapangan</h3>
              <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              </button>
            </div>
            <div className="h-48 md:h-64 rounded-lg bg-[var(--color-bg-dark)]/20 border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-text-muted)]">
              {harvest.photos && harvest.photos.length > 0 ? (
                <p className="text-sm">{harvest.photos.length} foto tersedia</p>
              ) : (
                <p className="text-sm">Tidak ada foto</p>
              )}
            </div>
          </div>

          {/* Workflow */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <h3 className="font-semibold mb-2">Workflow Persetujuan</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Pastikan data berat dan foto bukti sesuai dengan standar operasional sebelum memberikan persetujuan.
            </p>
            <div className="flex flex-col gap-3">
              <button className="w-full rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Approve Harvest
              </button>
              <button className="w-full rounded-full border-2 border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Reject &amp; Re-count
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Catatan Manager (Opsional)
              </label>
              <textarea
                placeholder="Masukkan catatan atau instruksi tambahan..."
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        {harvest.notes && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <h3 className="font-semibold mb-2">Catatan</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{harvest.notes}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
