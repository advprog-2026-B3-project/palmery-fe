"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/useAuth";
import { getHarvestById, resolvePhotoUrl, validateHarvest, type HarvestResult } from "@/lib/api";

export default function PanenDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isMandor } = useAuth();

  const [harvest, setHarvest] = useState<HarvestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  async function handleValidate(status: "APPROVED" | "REJECTED") {
    if (status === "REJECTED" && !rejectReason.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await validateHarvest(id, status, status === "REJECTED" ? rejectReason.trim() : undefined);
      setHarvest(updated);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memvalidasi panen");
    } finally {
      setSaving(false);
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
          <button
            onClick={loadHarvest}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)] transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

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
        <div className={`grid grid-cols-1 gap-4 mb-6 ${isMandor ? "md:grid-cols-3" : ""}`}>
          {/* Photo */}
          <div className={`bg-white rounded-xl border border-[var(--color-border)] p-5 ${isMandor ? "md:col-span-2" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Foto Bukti Lapangan</h3>
              <span className="text-xs text-[var(--color-text-muted)]">
                {harvest.photos?.length ?? 0} foto
              </span>
            </div>
            {harvest.photos && harvest.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {harvest.photos.map((photo, idx) => {
                  const photoSrc = resolvePhotoUrl(photo.url);
                  return (
                  <a
                    key={photo.id ?? `${photo.url}-${idx}`}
                    href={photoSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-[var(--color-border-light)] bg-[var(--color-border-light)] aspect-square relative group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoSrc}
                      alt={photo.filename ?? `Foto ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = "none";
                        const fallback = img.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div
                      className="absolute inset-0 hidden items-center justify-center text-xs text-[var(--color-text-muted)] p-2 text-center"
                    >
                      Foto tidak dapat dimuat
                      <br />
                      <span className="truncate max-w-full">{photo.filename}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white truncate">{photo.filename}</p>
                    </div>
                  </a>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 md:h-64 rounded-lg bg-[var(--color-bg-dark)]/20 border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-text-muted)]">
                <p className="text-sm">Tidak ada foto</p>
              </div>
            )}
          </div>

          {/* Workflow — only shown to Mandor */}
          {isMandor && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <h3 className="font-semibold mb-2">Workflow Persetujuan</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Pastikan data berat dan foto bukti sesuai dengan standar operasional sebelum memberikan persetujuan.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleValidate("APPROVED")}
                disabled={!isMandor || harvest.status !== "PENDING" || saving}
                className="w-full rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {saving ? "Memproses..." : "Approve Harvest"}
              </button>
              <button
                onClick={() => handleValidate("REJECTED")}
                disabled={!isMandor || harvest.status !== "PENDING" || saving}
                className="w-full rounded-full border-2 border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Reject &amp; Re-count
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Catatan Manager (Wajib jika menolak)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Wajib diisi jika menolak laporan..."
                disabled={harvest.status !== "PENDING"}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              />
            </div>
            {harvest.status !== "PENDING" && (
              <p className="text-xs text-[var(--color-text-muted)] mt-3">
                Laporan ini sudah diproses dan tidak dapat diubah lagi.
              </p>
            )}
          </div>
          )}
        </div>

        {/* Notes */}
        {harvest.notes && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-4">
            <h3 className="font-semibold mb-2">Catatan</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{harvest.notes}</p>
          </div>
        )}

        {/* Rejection reason — visible to everyone when rejected */}
        {harvest.status === "REJECTED" && harvest.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h3 className="font-semibold mb-2 text-red-800">Alasan Penolakan dari Mandor</h3>
            <p className="text-sm text-red-700">{harvest.rejectionReason}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
