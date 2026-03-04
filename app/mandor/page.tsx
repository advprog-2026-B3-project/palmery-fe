"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Delivery,
  fetchPengirimanAktifMandor,
} from "@/lib/manage-delivery-api";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function MandorDashboardPage() {
  const [data, setData] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  async function load() {
    setLoading(true);
    try {
      const result = await fetchPengirimanAktifMandor();
      setData(result);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memuat pengiriman aktif.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void load();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const filtered = data.filter((item) => {
    const matchSupir = search
      ? item.supir_id.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    return matchSupir && matchStatus;
  });

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard Mandor</h1>
            <p className="mt-1 text-sm text-zinc-300">
              Monitor semua pengiriman aktif di kebun Anda.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/mandor/pengiriman-baru"
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-zinc-100 hover:bg-emerald-500"
            >
              Buat Pengiriman Baru
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
              <label className="block text-xs text-zinc-400">Cari Supir</label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ID / nama supir"
                className="mt-1 w-48 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
              >
                <option value="">Semua</option>
                <option value="MEMUAT">Memuat</option>
                <option value="MENGIRIM">Mengirim</option>
                <option value="TIBA_DI_TUJUAN">Tiba di Tujuan</option>
                <option value="PENDING_MANDOR_REVIEW">
                  Pending Review Mandor
                </option>
                <option value="PENDING_ADMIN_REVIEW">
                  Pending Review Admin
                </option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-100 hover:bg-zinc-700"
            >
              Muat Ulang
            </button>
          </form>

          <div className="mt-4">
            {loading ? (
              <p className="text-sm text-zinc-300">
                Memuat pengiriman aktif...
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Tidak ada pengiriman aktif yang cocok dengan filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                    <tr>
                      <th className="px-3 py-2">ID Pengiriman</th>
                      <th className="px-3 py-2">Supir</th>
                      <th className="px-3 py-2">Kebun</th>
                      <th className="px-3 py-2">Total (kg)</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Dibuat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-800 last:border-0"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-zinc-200">
                          {item.id}
                        </td>
                        <td className="px-3 py-2 text-xs text-emerald-200">
                          <Link href={`/mandor/supir/${item.supir_id}`}>
                            {item.supir_id}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-300">
                          {item.kebun_id}
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-200">
                          {item.total_kg}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-400">
                          {new Date(item.created_at).toLocaleString("id-ID")}
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

