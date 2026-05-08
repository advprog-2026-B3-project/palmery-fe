"use client";

import { useEffect, useState } from "react";
import {
  Delivery,
  fetchPendingAdmin,
} from "@/lib/manage-delivery-api";
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
    default:
      return { label: status, dot: "bg-slate-400", text: "text-slate-600" };
  }
}

function approvalMandor(status: string) {
  if (status === "REJECTED_MANDOR") return { label: "Rejected", tone: "red" as const };
  if (
    status === "PENDING_ADMIN_REVIEW" ||
    status === "APPROVED_ADMIN" ||
    status === "REJECTED_ADMIN" ||
    status === "PARTIAL_REJECTED_ADMIN"
  ) {
    return { label: "Approved", tone: "green" as const };
  }
  if (status === "PENDING_MANDOR_REVIEW") return { label: "Pending", tone: "amber" as const };
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
  const [data, setData] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [date, setDate] = useState("");
  const [mandor, setMandor] = useState("");
  const [applied, setApplied] = useState({ date: "", mandor: "" });

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

  const mandorOptions = Array.from(new Set(data.map((d) => d.mandor_id))).sort();
  const filtered = data.filter((item) => {
    const matchMandor = applied.mandor ? item.mandor_id === applied.mandor : true;
    const matchDate = applied.date
      ? new Date(item.created_at).toISOString().slice(0, 10) === applied.date
      : true;
    return matchMandor && matchDate;
  });

  return (
    <AppShell section="Pengiriman" userLabel="Admin" userInitials="A">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Daftar Pengiriman
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Pengiriman yang menunggu review admin pusat.
          </p>
        </div>
        <Link
          href="/mandor/pengiriman-baru"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--palmery-green)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110"
        >
          <span className="text-lg leading-none">+</span> Tambah Pengiriman
        </Link>
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
              Nama Mandor
            </label>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <select
                value={mandor}
                onChange={(e) => setMandor(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="">Semua Mandor</option>
                {mandorOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setApplied({ date, mandor })}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--palmery-green)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={load}
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
                  <td className="px-6 py-6 text-slate-500" colSpan={6}>
                    Memuat pengiriman...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-slate-500" colSpan={6}>
                    Tidak ada pengiriman yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const status = statusBadge(item.status);
                  const mandorAppr = approvalMandor(item.status);
                  const adminAppr = approvalAdmin(item.status);
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-5 text-slate-900">
                        {item.supir_id}
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
                          <span className={`h-2 w-2 rounded-full ${mandorAppr.tone === "green" ? "bg-emerald-500" : mandorAppr.tone === "red" ? "bg-rose-500" : "bg-amber-500"}`} />
                          {mandorAppr.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 ${toneClasses(adminAppr.tone)}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${adminAppr.tone === "green" ? "bg-emerald-500" : adminAppr.tone === "red" ? "bg-rose-500" : "bg-amber-500"}`} />
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
