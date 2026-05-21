"use client";

import { useEffect, useState } from "react";
import { Pengiriman, fetchPendingAdmin } from "@/lib/manage-pengiriman-api";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

type ToastState = { type: "success" | "error"; message: string } | null;

function statusBadge(status: string) {
  switch (status) {
    case "MENGIRIM":
      return { label: "Mengirim", dot: "bg-blue-500", text: "text-blue-600" };
    case "TIBA_DI_TUJUAN":
      return { label: "Tiba", dot: "bg-emerald-500", text: "text-emerald-600" };
    case "MEMUAT":
      return { label: "Memuat", dot: "bg-amber-500", text: "text-amber-600" };
    case "PENDING_ADMIN_REVIEW":
      return { label: "Menunggu Admin", dot: "bg-amber-500", text: "text-amber-600" };
    default:
      return { label: status, dot: "bg-slate-400", text: "text-slate-600" };
  }
}

function approvalMandor(status: string) {
  if (status === "REJECTED_MANDOR") return { label: "Rejected", tone: "red" as const };
  if (status === "PENDING_ADMIN_REVIEW") {
    return { label: "Approved", tone: "green" as const };
  }
  return { label: "Pending", tone: "amber" as const };
}

function approvalAdmin(status: string) {
  if (status === "APPROVED_ADMIN") return { label: "Approved", tone: "green" as const };
  if (status === "REJECTED_ADMIN") return { label: "Rejected", tone: "red" as const };
  if (status === "PARTIAL_REJECTED_ADMIN") return { label: "Parsial", tone: "amber" as const };
  if (status === "PENDING_ADMIN_REVIEW") return { label: "Pending", tone: "amber" as const };
  return { label: "Pending", tone: "amber" as const };
}

function toneClasses(tone: "green" | "amber" | "red") {
  switch (tone) {
    case "green":
      return "text-emerald-600";
    case "red":
      return "text-rose-600";
    case "amber":
    default:
      return "text-amber-600";
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [date, setDate] = useState("");
  const [mandor, setMandor] = useState("");

  async function load(filters?: { mandor?: string; date?: string }) {
    setLoading(true);
    try {
      const result = await fetchPendingAdmin(filters);
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

  return (
    <AppShell section="Pengiriman" userLabel="Admin" userInitials="A">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Daftar Pengiriman
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Pengiriman yang telah disetujui mandor dan menunggu review admin.
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[260px]">
            <label className="text-sm font-medium text-slate-700">Tanggal</label>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm text-slate-700 outline-none"
              />
            </div>
          </div>
          <div className="min-w-[260px]">
            <label className="text-sm font-medium text-slate-700">
              Cari Mandor (ID)
            </label>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="text"
                value={mandor}
                onChange={(e) => setMandor(e.target.value)}
                placeholder="Nama / ID mandor"
                className="w-full text-sm text-slate-700 outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              load({
                mandor: mandor.trim() || undefined,
                date: date || undefined,
              })
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--palmery-green)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={() => load()}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Muat Ulang
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Supir</th>
                <th className="px-6 py-4 font-semibold">Mandor</th>
                <th className="px-6 py-4 font-semibold">Total Kg</th>
                <th className="px-6 py-4 font-semibold">Status Kirim</th>
                <th className="px-6 py-4 font-semibold">Approval Mandor</th>
                <th className="px-6 py-4 font-semibold">Approval Admin</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={7}>
                    Memuat pengiriman...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={7}>
                    Tidak ada pengiriman yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const status = statusBadge(item.status);
                  const mandorAppr = approvalMandor(item.status);
                  const adminAppr = approvalAdmin(item.status);
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-5 text-slate-900">
                        {item.supir_id}
                      </td>
                      <td className="px-6 py-5 text-slate-700">
                        {item.mandor_id}
                      </td>
                      <td className="px-6 py-5 font-semibold text-slate-900">
                        {item.total_kg} kg
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 ${status.text}`}>
                          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 ${toneClasses(mandorAppr.tone)}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${mandorAppr.tone === "green" ? "bg-emerald-500" : mandorAppr.tone === "red" ? "bg-rose-500" : "bg-amber-500"}`}
                          />
                          {mandorAppr.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 ${toneClasses(adminAppr.tone)}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${adminAppr.tone === "green" ? "bg-emerald-500" : adminAppr.tone === "red" ? "bg-rose-500" : "bg-amber-500"}`}
                          />
                          {adminAppr.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/pengiriman/${item.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--palmery-green)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
