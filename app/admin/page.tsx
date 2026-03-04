"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Delivery,
  approvePengirimanAdmin,
  fetchPendingAdmin,
  partialRejectPengirimanAdmin,
  rejectPengirimanAdmin,
} from "@/lib/manage-delivery-api";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function AdminDashboardPage() {
  const [data, setData] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  async function load() {
    setLoading(true);
    try {
      const result = await fetchPendingAdmin();
      setData(result);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memuat pengiriman pending.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: string) {
    const ok = window.confirm(
      `Setujui pengiriman ${id} dengan berat penuh (kg total)?`,
    );
    if (!ok) return;
    try {
      setActingId(id);
      await approvePengirimanAdmin(id);
      setToast({
        type: "success",
        message: "Pengiriman berhasil di-approve.",
      });
      await load();
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal approve pengiriman.",
      });
    } finally {
      setActingId(null);
    }
  }

  async function handlePartialReject(item: Delivery) {
    const kgStr = window.prompt(
      `Masukkan kg yang diakui (maks ${item.total_kg} kg):`,
      String(item.total_kg),
    );
    if (!kgStr) return;
    const kg = Number(kgStr);
    if (!Number.isFinite(kg) || kg <= 0) {
      setToast({
        type: "error",
        message: "Input kg tidak valid.",
      });
      return;
    }
    const reason = window.prompt("Alasan partial reject: (wajib diisi)", "");
    if (!reason) {
      setToast({
        type: "error",
        message: "Alasan wajib diisi untuk partial reject.",
      });
      return;
    }
    try {
      setActingId(item.id);
      await partialRejectPengirimanAdmin(item.id, kg, reason);
      setToast({
        type: "success",
        message: "Pengiriman berhasil di-partial reject.",
      });
      await load();
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal partial reject pengiriman.",
      });
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Alasan reject penuh: (wajib diisi)", "");
    if (!reason) {
      setToast({
        type: "error",
        message: "Alasan wajib diisi untuk reject.",
      });
      return;
    }
    try {
      setActingId(id);
      await rejectPengirimanAdmin(id, reason);
      setToast({
        type: "success",
        message: "Pengiriman berhasil di-reject.",
      });
      await load();
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal reject pengiriman.",
      });
    } finally {
      setActingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
            <p className="mt-1 text-sm text-zinc-300">
              Pengiriman yang menunggu review admin pusat.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">
              Pengiriman Pending Review Admin
            </h2>
            <button
              type="button"
              onClick={load}
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-700"
            >
              Muat Ulang
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-300">
              Memuat pengiriman pending...
            </p>
          ) : data.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Tidak ada pengiriman yang menunggu review admin.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">ID Pengiriman</th>
                    <th className="px-3 py-2">Supir</th>
                    <th className="px-3 py-2">Mandor</th>
                    <th className="px-3 py-2">Total (kg)</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Dibuat</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
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
                      <td className="px-3 py-2 text-xs text-zinc-300">
                        {item.supir_id}
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-300">
                        {item.mandor_id}
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
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            disabled={actingId === item.id}
                            className="rounded-md bg-emerald-600 px-2 py-1 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePartialReject(item)}
                            disabled={actingId === item.id}
                            className="rounded-md bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-500 disabled:opacity-60"
                          >
                            Parsial
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item.id)}
                            disabled={actingId === item.id}
                            className="rounded-md bg-rose-600 px-2 py-1 font-medium text-white hover:bg-rose-500 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

