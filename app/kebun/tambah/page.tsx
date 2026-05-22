"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { createPlantation } from "@/lib/api";

export default function TambahKebunPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    areaHa: "",
    code: "",
    coordTlLat: "",
    coordTlLon: "",
    coordTrLat: "",
    coordTrLon: "",
    coordBrLat: "",
    coordBrLon: "",
    coordBlLat: "",
    coordBlLon: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createPlantation({
        name: form.name,
        code: form.code || `KBN-${Date.now()}`,
        areaHa: parseFloat(form.areaHa) || 0,
        coordTlLat: parseFloat(form.coordTlLat) || 0,
        coordTlLon: parseFloat(form.coordTlLon) || 0,
        coordTrLat: parseFloat(form.coordTrLat) || 0,
        coordTrLon: parseFloat(form.coordTrLon) || 0,
        coordBrLat: parseFloat(form.coordBrLat) || 0,
        coordBrLon: parseFloat(form.coordBrLon) || 0,
        coordBlLat: parseFloat(form.coordBlLat) || 0,
        coordBlLon: parseFloat(form.coordBlLon) || 0,
      });
      router.push("/kebun");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah kebun");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <div className="text-sm text-[var(--color-text-muted)] mb-2">
          <Link href="/kebun" className="hover:text-[var(--color-primary)]">Kebun</Link>
          <span className="mx-2">›</span>
          <span>Tambah Kebun</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Tambah Kebun</h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Daftarkan aset lahan perkebunan sawit baru ke dalam sistem Palmery.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama Kebun */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Tulis Nama Kebun</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Blok A Estate Jaya"
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
                />
              </div>

              {/* Luas Kebun */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Tulis Luas Kebun</label>
                <div className="relative">
                  <input
                    type="number"
                    name="areaHa"
                    value={form.areaHa}
                    onChange={handleChange}
                    placeholder="Dalam Hektar (Ha)"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">Ha</span>
                </div>
              </div>

              {/* Kode Kebun */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Kode Kebun (Opsional)</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Auto-generated jika kosong"
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
                />
              </div>
            </div>

            {/* Coordinates section */}
            <div className="mt-6 pt-6 border-t border-[var(--color-border-light)]">
              <h3 className="text-sm font-medium mb-3">Koordinat Batas Kebun</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">TL Lat</label>
                  <input type="number" step="any" name="coordTlLat" value={form.coordTlLat} onChange={handleChange} placeholder="0.0" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">TL Lon</label>
                  <input type="number" step="any" name="coordTlLon" value={form.coordTlLon} onChange={handleChange} placeholder="0.0" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">TR Lat</label>
                  <input type="number" step="any" name="coordTrLat" value={form.coordTrLat} onChange={handleChange} placeholder="0.0" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">TR Lon</label>
                  <input type="number" step="any" name="coordTrLon" value={form.coordTrLon} onChange={handleChange} placeholder="0.0" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">BR Lat</label>
                  <input type="number" step="any" name="coordBrLat" value={form.coordBrLat} onChange={handleChange} placeholder="0.0" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">BR Lon</label>
                  <input type="number" step="any" name="coordBrLon" value={form.coordBrLon} onChange={handleChange} placeholder="0.0" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">BL Lat</label>
                  <input type="number" step="any" name="coordBlLat" value={form.coordBlLat} onChange={handleChange} placeholder="0.0" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">BL Lon</label>
                  <input type="number" step="any" name="coordBlLon" value={form.coordBlLon} onChange={handleChange} placeholder="0.0" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50" />
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="mt-6 flex items-start gap-3 bg-[var(--color-accent)]/5 border-l-4 border-[var(--color-accent)] rounded-r-lg p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p className="text-sm text-[var(--color-text-muted)]">
                Kode Kebun akan di generate otomatis oleh sistem setelah data disimpan untuk memastikan identitas unik aset.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-[var(--color-border-light)] flex items-center justify-center gap-4">
              <Link
                href="/kebun"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border-light)] transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {loading ? "Menyimpan..." : "Tambah Kebun"}
              </button>
            </div>
          </div>
        </form>

        {/* Bottom info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-xl border border-[var(--color-border)] p-6">
            <h3 className="font-semibold mb-2">Standardisasi Lahan</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Setiap kebun yang terdaftar akan dipantau melalui satelit dan sensor tanah secara otomatis untuk memastikan produktivitas maksimal.
            </p>
          </div>
          <div className="bg-[var(--color-bg-dark)] rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-2">Sertifikasi ISPO</h3>
            <p className="text-sm text-white/70">
              Siap untuk pelaporan audit tahunan.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
