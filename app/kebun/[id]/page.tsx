"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getPlantationById, getUsersByIds, type PlantationDetail, type UserSummary } from "@/lib/api";

export default function KebunDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [plantation, setPlantation] = useState<PlantationDetail | null>(null);
  const [mandors, setMandors] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlantation();
  }, [id]);

  async function loadPlantation() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlantationById(id);
      setPlantation(data);

      // Load mandor names
      if (data.assignedMandorIds && data.assignedMandorIds.length > 0) {
        try {
          const users = await getUsersByIds(data.assignedMandorIds);
          setMandors(users);
        } catch {
          // silently fail - mandor names are optional
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plantation");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["ADMIN", "MANDOR"]}>
        <div className="text-center py-12 text-[var(--color-text-muted)]">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error || !plantation) {
    return (
      <DashboardLayout allowedRoles={["ADMIN", "MANDOR"]}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error || "Plantation not found"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN", "MANDOR"]}>
      <div className="max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/kebun" className="hover:text-[var(--color-primary)]">Kebun</Link>
          <span className="mx-2">›</span>
          <span>{plantation.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{plantation.name}</h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                plantation.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {plantation.isActive ? "Active Production" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {plantation.code} • Luas: {plantation.areaHa} Hektar
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border-light)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Blok
            </button>
            <Link
              href="/panen/tambah"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Input Panen
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--color-text-muted)]">Panen Bulan Ini</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              </svg>
            </div>
            <p className="text-3xl font-bold">124.5 <span className="text-sm font-normal text-[var(--color-text-muted)]">Ton</span></p>
            <p className="text-xs text-green-600 mt-1">+12% vs bulan lalu</p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--color-text-muted)]">Rerata Rendemen (OER)</p>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/>
              </svg>
            </div>
            <p className="text-3xl font-bold">23.8 <span className="text-sm font-normal text-[var(--color-text-muted)]">%</span></p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Grade A &nbsp; Kualitas Premium</p>
          </div>

          {/* Mandor Card */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Mandor Terpilih</p>
            {mandors.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-sm font-bold text-[var(--color-primary)]">
                    {mandors[0].nama?.charAt(0) ?? "M"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mandors[0].nama}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">ID: {mandors[0].id.slice(0, 12)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-full border border-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-accent)]/10">
                    Hubungi
                  </button>
                  <button className="flex-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-border-light)]">
                    Pesan
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Belum ada mandor ditugaskan</p>
            )}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-[var(--color-bg-dark)] rounded-xl h-48 md:h-64 mb-6 flex items-end p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <p className="relative text-white text-sm">
            📍 Koordinat: {plantation.coordTlLat?.toFixed(4)}° N, {plantation.coordTlLon?.toFixed(4)}° E
          </p>
        </div>

        {/* Harvest Trend placeholder */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Tren Hasil Panen</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Visualisasi data 6 bulan terakhir</p>
            </div>
            <button className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium">
              6 Bulan Terakhir
            </button>
          </div>
          <div className="h-40 flex items-end justify-between gap-2 px-4">
            {["Mei", "Jun", "Jul", "Agu", "Sep", "Okt"].map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[var(--color-accent)]/30 rounded-t"
                  style={{ height: `${30 + Math.random() * 70}%` }}
                />
                <span className="text-xs text-[var(--color-text-muted)]">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Log Panen Terbaru */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-bold">Log Panen Terbaru</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-light)]">
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Tanggal</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Tonase (Kg)</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Pencatat</th>
                <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="px-6 py-3">18 Okt 2023</td>
                <td className="px-6 py-3">4,520 kg</td>
                <td className="px-6 py-3">
                  <span className="text-xs font-semibold text-green-600 uppercase">Verified</span>
                </td>
                <td className="px-6 py-3">Budi Santoso</td>
                <td className="px-6 py-3">
                  <button className="text-sm text-[var(--color-primary)] hover:underline">Detail</button>
                </td>
              </tr>
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="px-6 py-3">16 Okt 2023</td>
                <td className="px-6 py-3">3,890 kg</td>
                <td className="px-6 py-3">
                  <span className="text-xs font-semibold text-green-600 uppercase">Verified</span>
                </td>
                <td className="px-6 py-3">Budi Santoso</td>
                <td className="px-6 py-3">
                  <button className="text-sm text-[var(--color-primary)] hover:underline">Detail</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-3">14 Okt 2023</td>
                <td className="px-6 py-3">4,110 kg</td>
                <td className="px-6 py-3">
                  <span className="text-xs font-semibold text-yellow-600 uppercase">Pending</span>
                </td>
                <td className="px-6 py-3">Mandor Shift B</td>
                <td className="px-6 py-3">
                  <button className="text-sm text-[var(--color-primary)] hover:underline">Detail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
