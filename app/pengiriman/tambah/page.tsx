"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getDriversForMandor, getPanenSiapAngkut, createPengiriman } from "@/lib/api";
import type { DriverOption, ReadyHarvest } from "@/lib/api";

const MAX_PENGIRIMAN_KG = 400;

export default function TambahPengirimanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [panenList, setPanenList] = useState<ReadyHarvest[]>([]);

  const [selectedSupir, setSelectedSupir] = useState("");
  const [selectedPanen, setSelectedPanen] = useState<string[]>([]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data pengiriman");
    } finally {
      setLoadingData(false);
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
  const canPartiallyShipSingle = selectedPanen.length === 1 && totalKg > MAX_PENGIRIMAN_KG;
  const shipmentKg = canPartiallyShipSingle ? MAX_PENGIRIMAN_KG : totalKg;
  const canSubmit = drivers.length > 0 && panenList.length > 0 && (totalKg <= MAX_PENGIRIMAN_KG || canPartiallyShipSingle);

  function formatDate(date?: string) {
    if (!date) return "Tanggal panen tidak tersedia";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  }

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
    if (selectedPanen.length > 1 && totalKg > MAX_PENGIRIMAN_KG) {
      setError(`Total pengiriman tidak boleh melebihi ${MAX_PENGIRIMAN_KG} kg`);
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
              Pengiriman dibuat dari Hasil Panen APPROVED yang siap angkut di kebun Anda.
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
                    disabled={loadingData || drivers.length === 0}
                  >
                    <option value="">
                      {loadingData ? "Memuat supir..." : "Pilih supir dari kebun yang sama..."}
                    </option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.nama}</option>
                    ))}
                  </select>
                  {!loadingData && drivers.length === 0 && (
                    <p className="text-xs text-amber-700 mt-2">
                      Belum ada Supir di kebun Anda. Admin perlu menempatkan Supir ke Kebun yang sama.
                    </p>
                  )}
                </div>

                {/* Total Kg */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Total Kg</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={shipmentKg.toFixed(2)}
                      readOnly
                      className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2.5 pr-12 text-sm bg-gray-50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] font-medium">KG</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">
                    Maksimal {MAX_PENGIRIMAN_KG} kg per pengiriman.
                  </p>
                  {canPartiallyShipSingle ? (
                    <p className="text-xs text-amber-700 mt-1">
                      Satu panen besar akan otomatis diambil maksimal {MAX_PENGIRIMAN_KG} kg, sisanya tetap tersimpan di hasil panen.
                    </p>
                  ) : totalKg > MAX_PENGIRIMAN_KG && (
                    <p className="text-xs text-red-600 mt-1">
                      Kurangi hasil panen yang dipilih agar total tidak melebihi {MAX_PENGIRIMAN_KG} kg.
                    </p>
                  )}
                </div>

                {/* Pilih Panen */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Pilih Hasil Panen</label>
                  {loadingData ? (
                    <div className="border border-[var(--color-border)] rounded-lg p-3 text-sm text-[var(--color-text-muted)]">
                      Memuat hasil panen siap angkut...
                    </div>
                  ) : panenList.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto border border-[var(--color-border)] rounded-lg p-2 space-y-2">
                      {panenList.map((p) => {
                        const selected = selectedPanen.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className="flex items-start gap-3 px-3 py-2 rounded hover:bg-[var(--color-border-light)] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => togglePanen(p.id)}
                              className="rounded mt-1"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium">{p.berat_kg} kg</span>
                                <span className="text-[11px] rounded-full bg-green-50 text-green-700 px-2 py-0.5">
                                  {p.status || "APPROVED"}
                                </span>
                              </span>
                              <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">
                                {formatDate(p.tanggal_panen)} · Buruh {p.buruh_id?.slice(0, 8) || "-"} · Panen {p.id.slice(0, 8)}
                              </span>
                              {p.berita_hasil_panen && (
                                <span className="block text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                                  {p.berita_hasil_panen}
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                      Belum ada Hasil Panen APPROVED yang siap angkut. Buruh harus submit panen, lalu Mandor approve panen sebelum Pengiriman bisa dibuat.
                    </div>
                  )}
                </div>

                {selectedPanen.length > 0 && (
                  <div className="rounded-lg bg-[var(--color-border-light)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                    {selectedPanen.length} hasil panen dipilih dari daftar siap angkut. Setelah pengiriman dibuat, hasil panen ini tidak muncul lagi untuk pengiriman lain.
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || loadingData || !canSubmit}
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
                  Pengiriman hanya bisa dibuat dari Hasil Panen yang sudah APPROVED dan belum pernah dipakai pengiriman.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 shrink-0" />
                  Supir yang muncul hanya Supir yang ditempatkan Admin di Kebun yang sama dengan Mandor.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 shrink-0" />
                  Total berat satu pengiriman dibatasi maksimal {MAX_PENGIRIMAN_KG} kg.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
