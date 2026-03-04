"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Driver,
  HarvestSummary,
  createPengirimanBaru,
  fetchDrivers,
  fetchPanenSiapAngkut,
} from "@/lib/manage-delivery-api";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function MandorCreatePengirimanPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
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

  const filteredDrivers = useMemo(() => {
    if (!driverSearch) return drivers;
    return drivers.filter((d) =>
      d.nama.toLowerCase().includes(driverSearch.toLowerCase()),
    );
  }, [drivers, driverSearch]);

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
        supir_id: selectedSupir,
        panen_ids: chosenPanen,
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
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Buat Pengiriman Baru</h1>
            <p className="mt-1 text-sm text-zinc-300">
              Pilih supir dan panen siap angkut. Total berat maksimal 400kg.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link
              href="/mandor"
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-zinc-100 hover:bg-zinc-700"
            >
              Kembali ke Dashboard Mandor
            </Link>
          </div>
        </header>

        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 text-sm">
          {loading ? (
            <p className="text-zinc-300">Memuat data supir dan panen...</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold">Pilih Supir</h2>
                  <input
                    type="text"
                    value={driverSearch}
                    onChange={(event) => setDriverSearch(event.target.value)}
                    placeholder="Cari nama supir"
                    className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
                  />
                  <div className="mt-3 max-h-56 space-y-1 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 p-2 text-xs">
                    {filteredDrivers.length === 0 ? (
                      <p className="text-zinc-500">Supir tidak ditemukan.</p>
                    ) : (
                      filteredDrivers.map((driver) => (
                        <label
                          key={driver.id}
                          className="flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1 hover:bg-zinc-900"
                        >
                          <span className="flex flex-col">
                            <span className="font-medium">{driver.nama}</span>
                            <span className="text-[11px] text-zinc-400">
                              {driver.id} · Kebun {driver.kebun_id}
                            </span>
                          </span>
                          <input
                            type="radio"
                            name="supir"
                            value={driver.id}
                            checked={selectedSupir === driver.id}
                            onChange={() => setSelectedSupir(driver.id)}
                          />
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold">Panen Siap Angkut</h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    Centang panen yang akan dimasukkan ke pengiriman ini.
                  </p>
                  <div className="mt-3 max-h-56 space-y-1 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 p-2 text-xs">
                    {panen.length === 0 ? (
                      <p className="text-zinc-500">
                        Belum ada panen berstatus &quot;Siap Angkut&quot;.
                      </p>
                    ) : (
                      panen.map((p) => (
                        <label
                          key={p.id}
                          className="flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1 hover:bg-zinc-900"
                        >
                          <span className="flex flex-col">
                            <span className="font-medium">
                              {p.id} · {p.berat_kg} kg
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Kebun {p.kebun_id}
                            </span>
                          </span>
                          <input
                            type="checkbox"
                            checked={Boolean(selectedPanen[p.id])}
                            onChange={(event) =>
                              setSelectedPanen((prev) => ({
                                ...prev,
                                [p.id]: event.target.checked,
                              }))
                            }
                          />
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4 text-sm">
                <div>
                  <p className="text-zinc-300">
                    Total Berat Terpilih:{" "}
                    <span className="font-semibold">{totalKg} kg</span>
                  </p>
                  {totalKg > 400 && (
                    <p className="mt-1 text-xs text-rose-300">
                      Total melebihi batas maksimum 400kg. Kurangi pilihan
                      panen.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {submitting ? "Menyimpan..." : "Buat Pengiriman"}
                </button>
              </div>
            </>
          )}
        </section>

        {toast && (
          <div className="fixed bottom-4 right-4 max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm shadow-lg">
            <p
              className={
                toast.type === "success" ? "text-emerald-300" : "text-rose-300"
              }
            >
              {toast.message}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

