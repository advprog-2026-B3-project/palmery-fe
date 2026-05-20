"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  SupirDriver,
  HarvestSummary,
  createPengirimanBaru,
  fetchDrivers,
  fetchPanenSiapAngkut,
} from "@/lib/manage-pengiriman-api";
import { AppShell } from "@/components/AppShell";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function MandorCreatePengirimanPage() {
  const [drivers, setDrivers] = useState<SupirDriver[]>([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedSupir, setSelectedSupir] = useState<string>("");
  const [panen, setPanen] = useState<HarvestSummary[]>([]);
  const [selectedPanen, setSelectedPanen] = useState<Record<string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  async function loadInitial() {
    setLoading(true);
    try {
      const [driverList, panenList] = await Promise.all([
        fetchDrivers(""),
        fetchPanenSiapAngkut(),
      ]);
      setDrivers(driverList);
      setPanen(panenList);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memuat data supir/panen.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    async function searchDrivers() {
      try {
        const driverList = await fetchDrivers(driverSearch);
        setDrivers(driverList);
      } catch {
        // keep previous list on search failure
      }
    }
    const timer = setTimeout(() => {
      void searchDrivers();
    }, 300);
    return () => clearTimeout(timer);
  }, [driverSearch]);

  const filteredDrivers = useMemo(() => drivers, [drivers]);

  const totalKg = useMemo(
    () =>
      panen
        .filter((p) => selectedPanen[p.id])
        .reduce((sum, p) => sum + p.berat_kg, 0),
    [panen, selectedPanen],
  );

  async function handleSubmit() {
    if (!selectedSupir) {
      setToast({
        type: "error",
        message: "Pilih supir terlebih dahulu.",
      });
      return;
    }
    const chosenPanen = panen
      .filter((p) => selectedPanen[p.id])
      .map((p) => p.id);
    if (chosenPanen.length === 0) {
      setToast({
        type: "error",
        message: "Pilih minimal satu panen siap angkut.",
      });
      return;
    }
    if (totalKg > 400) {
      setToast({
        type: "error",
        message:
          "Total berat melebihi 400kg. Kurangi pilihan panen sebelum membuat pengiriman.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createPengirimanBaru({
        supirId: selectedSupir,
        panenIds: chosenPanen,
      });
      setToast({
        type: "success",
        message: "Pengiriman baru berhasil dibuat.",
      });
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal membuat pengiriman baru.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell section="Pengiriman" userLabel="Mandor" userInitials="M">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Buat Pengiriman Baru
          </h1>
        </div>
        <Link
          href="/mandor"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Kembali
        </Link>
      </div>

      <section className="mx-auto mt-6 max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">
          Atur pengiriman hasil panen ke pabrik.
        </p>

        {loading ? (
          <p className="mt-6 text-slate-500">Memuat data supir dan panen...</p>
        ) : (
          <>
            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">
                Supir Truk
              </label>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <select
                  value={selectedSupir}
                  onChange={(e) => setSelectedSupir(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="">Pilih Supir</option>
                  {filteredDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama} ({d.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(event) => setDriverSearch(event.target.value)}
                  placeholder="Cari nama supir"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Daftar Hasil Panen
                </label>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Max 400 kg
                </span>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 p-3">
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {panen.length === 0 ? (
                    <p className="px-2 py-8 text-center text-sm text-slate-500">
                      Belum ada panen berstatus Siap Angkut.
                    </p>
                  ) : (
                    panen.map((p) => (
                      <label
                        key={p.id}
                        className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="h-5 w-5 accent-[var(--palmery-green)]"
                            checked={Boolean(selectedPanen[p.id])}
                            onChange={(event) =>
                              setSelectedPanen((prev) => ({
                                ...prev,
                                [p.id]: event.target.checked,
                              }))
                            }
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {p.id}
                            </p>
                            <p className="text-xs text-slate-500">
                              Kebun {p.kebun_id}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {p.berat_kg} kg
                        </p>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div
              className={`mt-6 rounded-2xl border p-5 ${
                totalKg > 400
                  ? "border-rose-300 bg-rose-50"
                  : "border-emerald-300 bg-emerald-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Total Berat Terpilih
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {Object.values(selectedPanen).filter(Boolean).length} hasil
                    panen
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {totalKg > 400
                      ? "Melebihi batas maksimum 400 kg"
                      : "Masih dalam batas maksimum 400 kg"}
                  </p>
                </div>
                <p className="text-3xl font-semibold text-slate-900">
                  {totalKg} kg
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Link
                href="/mandor"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-[var(--palmery-green)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? "Menyimpan..." : "Buat Pengiriman"}
              </button>
            </div>
          </>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-4 right-4 max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg">
          <p className={toast.type === "success" ? "text-emerald-700" : "text-rose-700"}>
            {toast.message}
          </p>
        </div>
      )}
    </AppShell>
  );
}
