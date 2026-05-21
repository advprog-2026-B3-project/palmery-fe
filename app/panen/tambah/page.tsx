"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { submitHarvest } from "@/lib/api";

export default function TambahPanenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    plantationId: "",
    mandorId: "",
    harvestDate: today,
    kgHarvested: "",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitHarvest({
        plantationId: form.plantationId,
        mandorId: form.mandorId,
        harvestDate: form.harvestDate,
        kgHarvested: parseFloat(form.kgHarvested) || 0,
        notes: form.notes,
      });
      router.push("/panen");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah hasil panen");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm({
      plantationId: "",
      mandorId: "",
      harvestDate: today,
      kgHarvested: "",
      notes: "",
    });
    setError(null);
  }

  return (
    <DashboardLayout allowedRoles={["BURUH"]}>
      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/panen" className="hover:text-[var(--color-primary)]">Panen</Link>
          <span className="mx-2">›</span>
          <span>Tambah Hasil</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Tambah Hasil Panen</h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Catat data hasil panen harian dari perkebunan secara akurat untuk memantau produktivitas dan logistik pengiriman.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pilih Buruh / Plantation */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Pilih Buruh</label>
                <select
                  name="plantationId"
                  value={form.plantationId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] bg-white"
                >
                  <option value="">Pilih nama pekerja lapangan...</option>
                </select>
              </div>

              {/* Pilih Tanggal */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Pilih Tanggal</label>
                <input
                  type="date"
                  name="harvestDate"
                  value={form.harvestDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Default ke tanggal hari ini.</p>
              </div>
            </div>

            {/* Total Kg */}
            <div className="mt-5">
              <label className="block text-sm font-medium mb-1.5">Total Kg</label>
              <div className="relative">
                <input
                  type="number"
                  name="kgHarvested"
                  value={form.kgHarvested}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] font-medium">KG</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Masukkan berat bersih dalam satuan Kilogram (Kg).</p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {loading ? "Menyimpan..." : "Tambah Hasil"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border-light)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Reset Form
              </button>
            </div>
          </div>
        </form>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                </svg>
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">Target Harian</span>
            </div>
            <p className="text-2xl font-bold">2,450 Kg</p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">Aktif di Lapangan</span>
            </div>
            <p className="text-2xl font-bold">12 Pekerja</p>
            <p className="text-xs text-[var(--color-text-muted)]">Sesuai shift pagi</p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">Entry Terakhir</span>
            </div>
            <p className="text-lg font-bold">Andi A. - 450Kg</p>
            <p className="text-xs text-[var(--color-text-muted)]">10 menit yang lalu</p>
          </div>
        </div>

        {/* Banner */}
        <div className="rounded-2xl bg-[var(--color-bg-dark)] h-48 flex items-end p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="relative text-white text-lg font-medium">
            Optimalisasi Hasil Alam melalui Presisi Data.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
