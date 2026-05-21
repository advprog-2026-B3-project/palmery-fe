"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getPengirimanById, type Pengiriman } from "@/lib/api";

export default function PengirimanDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [pengiriman, setPengiriman] = useState<Pengiriman | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPengiriman();
  }, [id]);

  async function loadPengiriman() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPengirimanById(id);
      setPengiriman(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pengiriman");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["ADMIN", "MANDOR", "SUPIR"]}>
        <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error || !pengiriman) {
    return (
      <DashboardLayout allowedRoles={["ADMIN", "MANDOR", "SUPIR"]}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error || "Pengiriman not found"}
        </div>
      </DashboardLayout>
    );
  }

  function statusColor(status: string) {
    const colors: Record<string, string> = {
      MEMUAT: "bg-blue-100 text-blue-700",
      DALAM_PERJALANAN: "bg-yellow-100 text-yellow-700",
      TIBA: "bg-green-100 text-green-700",
      APPROVED_MANDOR: "bg-emerald-100 text-emerald-700",
      APPROVED_ADMIN: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return colors[status] ?? "bg-gray-100 text-gray-700";
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN", "MANDOR", "SUPIR"]}>
      <div className="max-w-5xl">
        {/* Back */}
        <Link href="/pengiriman" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-4">
          ← Detail Pengiriman
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold font-mono">
                  #PLM-{id.slice(0, 5).toUpperCase()}
                </h1>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColor(pengiriman.status)}`}>
                  {pengiriman.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                📅 {new Date(pengiriman.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                {" • "}
                {new Date(pengiriman.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Cetak Surat Jalan
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Ubah Data
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Timeline */}
          <div className="md:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="text-lg font-bold mb-4">Timeline Pengiriman</h2>
              <div className="space-y-6 relative">
                <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-[var(--color-border)]" />

                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Pengiriman Disetujui</p>
                    <p className="font-medium text-sm">Mandor Kebun: {pengiriman.mandor_id.slice(0, 12)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(pengiriman.created_at).toLocaleDateString("id-ID")} • {new Date(pengiriman.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center shrink-0 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-accent)] font-medium">Truk Meninggalkan Kebun</p>
                    <p className="font-medium text-sm">Kebun ID: {pengiriman.kebun_id.slice(0, 12)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(pengiriman.updated_at).toLocaleDateString("id-ID")} • {new Date(pengiriman.updated_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-medium">Menunggu Validasi Pabrik</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Admin Pabrik: -</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cargo Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
                <h3 className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  Informasi Kargo
                </h3>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">Total Berat (Bruto)</span>
                    <span className="text-2xl font-bold">{pengiriman.total_kg} <span className="text-sm font-normal">kg</span></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">Jenis Muatan</span>
                    <span className="text-sm font-medium">TBS (Palm Fruit)</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">Jumlah Panen</span>
                    <span className="text-sm font-medium">{pengiriman.panen_ids.length} batch</span>
                  </div>
                  {pengiriman.recognized_kg && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">Berat Diakui</span>
                      <span className="text-sm font-medium">{pengiriman.recognized_kg} kg</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
                <h3 className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Driver &amp; Armada
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-sm font-bold text-[var(--color-primary)]">
                    S
                  </div>
                  <div>
                    <p className="font-medium text-sm">Supir</p>
                    <p className="text-xs text-[var(--color-text-muted)]">ID: {pengiriman.supir_id.slice(0, 12)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Verification */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
              <h3 className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-3">
                Verifikasi Keamanan
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border-light)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mandor Kebun</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Verified</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border-light)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Admin Pabrik</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Pending Arrival</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-300 text-yellow-700">Validasi</span>
                </div>
              </div>
            </div>

            {/* Location placeholder */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Lokasi Real-time</h3>
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="h-32 rounded-lg bg-[var(--color-bg-dark)]/20 border border-[var(--color-border-light)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                Map placeholder
              </div>
            </div>

            {/* Rejected reason */}
            {pengiriman.rejected_reason && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                <h3 className="text-sm font-semibold text-red-700 mb-2">Alasan Penolakan</h3>
                <p className="text-sm text-red-600">{pengiriman.rejected_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
