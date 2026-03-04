"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Delivery,
  Driver,
  fetchDrivers,
  fetchRiwayatSupir,
} from "@/lib/manage-delivery-api";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function MandorSupirProfilPage() {
  const params = useParams<{ id: string }>();
  const supirId = params?.id ?? "";
  const [driver, setDriver] = useState<Driver | null>(null);
  const [riwayat, setRiwayat] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    async function load() {
      if (!supirId) return;
      setLoading(true);
      try {
        const [drivers, history] = await Promise.all([
          fetchDrivers(""),
          fetchRiwayatSupir({
            from: "2000-01-01",
            to: new Date().toISOString().slice(0, 10),
          }),
        ]);
        setDriver(drivers.find((d) => d.id === supirId) ?? null);
        setRiwayat(history.filter((d) => d.supir_id === supirId));
      } catch (error) {
        setToast({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Gagal memuat profil supir.",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supirId]);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Profil Supir</h1>
            <p className="mt-1 text-sm text-zinc-300">
              Detail supir dan riwayat pengirimannya.
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

        {loading ? (
          <p className="text-sm text-zinc-300">Memuat data supir...</p>
        ) : (
          <>
            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 text-sm">
              {driver ? (
                <div className="space-y-1">
                  <p className="text-zinc-200">
                    <span className="font-semibold">Nama:</span> {driver.nama}
                  </p>
                  <p className="text-zinc-200">
                    <span className="font-semibold">ID Supir:</span>{" "}
                    {driver.id}
                  </p>
                  <p className="text-zinc-200">
                    <span className="font-semibold">Kebun:</span>{" "}
                    {driver.kebun_id}
                  </p>
                  <p className="text-zinc-200">
                    <span className="font-semibold">Kontak:</span>{" "}
                    {driver.kontak}
                  </p>
                </div>
              ) : (
                <p className="text-zinc-400">
                  Data supir tidak ditemukan di kebun ini.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 text-sm">
              <h2 className="text-sm font-semibold">
                Riwayat Pengiriman Supir
              </h2>
              <div className="mt-3 max-h-[420px] overflow-y-auto">
                {riwayat.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Belum ada riwayat pengiriman untuk supir ini.
                  </p>
                ) : (
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-zinc-800 uppercase text-zinc-400">
                      <tr>
                        <th className="px-3 py-2">ID Pengiriman</th>
                        <th className="px-3 py-2">Tanggal</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Total (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riwayat.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-zinc-800 last:border-0"
                        >
                          <td className="px-3 py-2 font-mono text-[11px] text-zinc-200">
                            {item.id}
                          </td>
                          <td className="px-3 py-2 text-[11px] text-zinc-400">
                            {new Date(item.created_at).toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2 text-[11px]">
                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono">
                              {item.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-[11px] text-zinc-200">
                            {item.total_kg}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}

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

