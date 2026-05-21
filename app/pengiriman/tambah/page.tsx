"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getDriversForMandor, getPanenSiapAngkut, createPengiriman } from "@/lib/api";

export default function TambahPengirimanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [drivers, setDrivers] = useState<{ id: string; nama: string }[]>([]);
  const [panenList, setPanenList] = useState<{ id: string; berat_kg: number; kebun_id: string }[]>([]);

  const [selectedSupir, setSelectedSupir] = useState("");
  const [selectedPanen, setSelectedPanen] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [d, p] = await Promise.all([
        getDriversForMandor(),
        getPanenSiapAngkut(),
      ]);
      setDrivers(d);
      setPanenList(p);
    } catch {
      // silently fail - user can still fill manually
    }
  }

  function togglePanen(id: string) {
    setSelectedPanen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const totalKg = panenList
    .filter((p) => selectedPanen.includes(p.id))
    .reduce((sum, p) => sum + p.berat_kg, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSupir) {
      setError("Pilih supir terlebih dahulu");
      return;
    }
    if (selectedPanen.length === 0) {
      setError("Pilih minimal satu hasil panen");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPengiriman(selectedSupir, selectedPanen);
      router.push("/pengiriman");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pengiriman");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout allowedRoles={["MANDOR"]}>
      <div className="max-w-4xl">
        {/* Back link */}
        <Link href="/pengiriman" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-4">
          ← Back to Logistics Management
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Tambah Pengiriman</h1>
            <p className="text-[var(--color-text-muted)] mb-6 text-sm">
              Masukan detail logistik pengiriman hasil panen untuk pelacakan armada.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 space-y-5">
                {/* Pilih Supir */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Pilih Supir</label>
                  <select
                    value={selectedSupir}
                    onChange={(e) => setSelectedSupir(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] bg-white"
                  >
                    <option value="">Pilih supir dari database...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Total Kg */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Total Kg</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={totalKg.toFixed(2)}
                      readOnly
                      className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 pr-12 text-sm bg-gray-50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] font-medium">KG</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">
                    Berat bersih berdasarkan timbangan gerbang masuk.
                  </p>
                </div>

                {/* Pilih Panen */}
                {panenList.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Pilih Hasil Panen</label>
                    <div className="max-h-40 overflow-y-auto border border-[var(--color-border)] rounded-lg p-2 space-y-1">
                      {panenList.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--color-border-light)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPanen.includes(p.id)}
                            onChange={() => togglePanen(p.id)}
                            className="rounded"
                          />
                          <span className="text-sm">{p.berat_kg} kg</span>
                          <span className="text-xs text-[var(--color-text-muted)]">({p.id.slice(0, 8)})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Catatan */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Catatan Tambahan (Opsional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Kondisi jalan licin, estimasi tiba diperpanjang..."
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>
                  </svg>
                  {loading ? "Menyimpan..." : "Tambah Pengiriman"}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-4">
            {/* Logistics Hub Card */}
            <div className="rounded-xl bg-[var(--color-bg-dark)] p-6 text-white min-h-[200px] flex flex-col justify-end relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative">
                <h3 className="text-xl font-bold mb-1">Logistics Hub</h3>
                <p className="text-sm text-white/70">
                  Sistem pemantauan armada real-time Palmery.
                </p>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">Informasi Pengiriman</h4>
              </div>
              <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 shrink-0" />
                  Data pengiriman akan langsung disinkronisasi dengan portal Payroll supir.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 shrink-0" />
                  Pastikan &ldquo;Total Kg&rdquo; sesuai dengan surat jalan resmi.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 shrink-0" />
                  Admin akan menerima notifikasi otomatis setelah data diverifikasi.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
