"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Delivery,
  DeliveryStatus,
  fetchPengirimanAktifSupir,
  updateStatusSupir,
} from "@/lib/manage-delivery-api";

type ToastState = { type: "success" | "error"; message: string } | null;

function nextStatus(status: DeliveryStatus | string): DeliveryStatus | null {
  switch (status) {
    case "MEMUAT":
      return "MENGIRIM";
    case "MENGIRIM":
      return "TIBA_DI_TUJUAN";
    default:
      return null;
  }
}

export default function SupirDashboardPage() {
  const [data, setData] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  async function load() {
    setLoading(true);
    try {
      const result = await fetchPengirimanAktifSupir();
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
    load();
  }, []);

  async function handleUpdateStatus(item: Delivery) {
    const target = nextStatus(item.status);
    if (!target) return;

    const label =
      target === "MENGIRIM"
        ? "Mengirim"
        : target === "TIBA_DI_TUJUAN"
          ? "Tiba di Tujuan"
          : target;

    const ok = window.confirm(
      `Ubah status pengiriman ${item.id} menjadi "${label}"?`,
    );
    if (!ok) return;

    try {
      setUpdatingId(item.id);
      await updateStatusSupir(item.id, target);
      setToast({
        type: "success",
        message: "Status pengiriman berhasil diperbarui.",
      });
      await load();
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status pengiriman.",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard Supir</h1>
            <p className="mt-1 text-sm text-zinc-300">
              Daftar pengiriman aktif yang sedang Anda tangani.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/supir/riwayat"
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-zinc-100 hover:bg-zinc-700"
            >
              Lihat Riwayat
            </Link>
          </div>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Pengiriman Aktif</h2>
            <button
              type="button"
              onClick={load}
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-700"
            >
              Muat Ulang
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-300">Memuat pengiriman...</p>
          ) : data.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Tidak ada pengiriman aktif saat ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">ID Pengiriman</th>
                    <th className="px-3 py-2">Mandor/Kebun</th>
                    <th className="px-3 py-2">Total (kg)</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Dibuat</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => {
                    const target = nextStatus(item.status);
                    const hasNext = Boolean(target);
                    const nextLabel =
                      target === "MENGIRIM"
                        ? "Set ke Mengirim"
                        : target === "TIBA_DI_TUJUAN"
                          ? "Set ke Tiba di Tujuan"
                          : "Update Status";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-800 last:border-0"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-zinc-200">
                          {item.id}
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-300">
                          {item.mandor_id} / {item.kebun_id}
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
                        <td className="px-3 py-2 text-right text-xs">
                          {hasNext ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item)}
                              disabled={updatingId === item.id}
                              className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                            >
                              {updatingId === item.id
                                ? "Menyimpan..."
                                : nextLabel}
                            </button>
                          ) : (
                            <span className="text-zinc-500">Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

