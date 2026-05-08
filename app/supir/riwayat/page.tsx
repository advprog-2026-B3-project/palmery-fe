"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Delivery, fetchRiwayatSupir } from "@/lib/manage-delivery-api";

type ToastState = { type: "success" | "error"; message: string } | null;

function todayRange(): { from: string; to: string } {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 7);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

export default function SupirRiwayatPage() {
  const initialRange = todayRange();
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [data, setData] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  async function load() {
    if (!from || !to) return;
    setLoading(true);
    try {
      const result = await fetchRiwayatSupir({ from, to });
      setData(result);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal memuat riwayat.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Riwayat Pengiriman Supir</h1>
            <p className="mt-1 text-sm text-zinc-300">
              Lihat riwayat pengiriman beserta alasan reject dan kg diakui.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link
              href="/supir"
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-zinc-100 hover:bg-zinc-700"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
          <form
            className="flex flex-wrap items-end gap-3 text-sm"
            onSubmit={(event) => {
              event.preventDefault();
              load();
            }}
          >
            <div>
              <label className="block text-xs text-zinc-400">Dari Tanggal</label>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400">Sampai Tanggal</label>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="mt-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500"
            >
              Terapkan Filter
            </button>
          </form>

          <div className="mt-4">
            {loading ? (
              <p className="text-sm text-zinc-300">Memuat riwayat...</p>
            ) : data.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Tidak ada pengiriman pada rentang tanggal ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                    <tr>
                      <th className="px-3 py-2">ID Pengiriman</th>
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Total (kg)</th>
                      <th className="px-3 py-2">Kg Diakui</th>
                      <th className="px-3 py-2">Alasan Reject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-800 last:border-0"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-zinc-200">
                          {item.id}
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-400">
                          {new Date(item.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-200">
                          {item.total_kg}
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-200">
                          {item.status === "PARTIAL_REJECTED_ADMIN"
                            ? item.recognized_kg ?? "-"
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-300">
                          {item.status === "REJECTED_ADMIN" ||
                          item.status === "PARTIAL_REJECTED_ADMIN" ||
                          item.status === "REJECTED_MANDOR"
                            ? item.rejected_reason ?? "-"
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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

