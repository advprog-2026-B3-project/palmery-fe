"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Pengiriman,
  approvePengirimanAdmin,
  fetchPengirimanAdminDetail,
  partialRejectPengirimanAdmin,
  rejectPengirimanAdmin,
} from "@/lib/manage-pengiriman-api";
import { AppShell } from "@/components/AppShell";

type ToastState = { type: "success" | "error"; message: string } | null;

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

function toneDot(tone: "green" | "amber" | "red") {
  return tone === "green"
    ? "bg-emerald-500"
    : tone === "red"
      ? "bg-rose-500"
      : "bg-amber-500";
}

export default function AdminPengirimanDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [data, setData] = useState<Pengiriman | null>(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const result = await fetchPengirimanAdminDetail(id);
      setData(result);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal memuat detail pengiriman.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const mandorAppr = useMemo(
    () => (data ? approvalMandor(data.status) : null),
    [data],
  );
  const adminAppr = useMemo(
    () => (data ? approvalAdmin(data.status) : null),
    [data],
  );

  const canAct = data?.status === "PENDING_ADMIN_REVIEW";

  async function handleApprove() {
    if (!data) return;
    const ok = window.confirm("Approve pengiriman ini dengan berat penuh?");
    if (!ok) return;
    try {
      setActing(true);
      await approvePengirimanAdmin(data.id);
      setToast({ type: "success", message: "Pengiriman berhasil di-approve." });
      await load();
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal approve pengiriman.",
      });
    } finally {
      setActing(false);
    }
  }

  async function handleRejectFull() {
    if (!data) return;
    const reason = window.prompt("Alasan reject penuh: (wajib diisi)", "");
    if (!reason) return;
    try {
      setActing(true);
      await rejectPengirimanAdmin(data.id, reason);
      setToast({ type: "success", message: "Pengiriman berhasil di-reject." });
      await load();
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal reject pengiriman.",
      });
    } finally {
      setActing(false);
    }
  }

  async function handlePartial() {
    if (!data) return;
    const kgStr = window.prompt(
      `Masukkan kg yang diakui (maks ${data.total_kg} kg):`,
      String(data.total_kg),
    );
    if (!kgStr) return;
    const kg = Number(kgStr);
    if (!Number.isFinite(kg) || kg <= 0) {
      setToast({ type: "error", message: "Input kg tidak valid." });
      return;
    }
    const reason = window.prompt("Alasan partial reject: (wajib diisi)", "");
    if (!reason) return;
    try {
      setActing(true);
      await partialRejectPengirimanAdmin(data.id, kg, reason);
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
      setActing(false);
    }
  }

  return (
    <AppShell section="Pengiriman" userLabel="Admin" userInitials="A">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Detail Pengiriman
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tinjau detail dan status approval.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Kembali
        </Link>
      </div>

      {loading || !data ? (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-500">
            {loading ? "Memuat..." : "Data tidak ditemukan."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
            <h2 className="text-base font-semibold text-slate-900">
              Detail Pengiriman
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Supir</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {data.supir_id}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Mandor Pengawas</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {data.mandor_id}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Berat</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {data.total_kg} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status Pengiriman</p>
                <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {data.status}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">
                Daftar Hasil Panen
              </h3>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Panen ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.panen_ids.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-slate-500">
                          Tidak ada panen.
                        </td>
                      </tr>
                    ) : (
                      data.panen_ids.map((pid) => (
                        <tr key={pid}>
                          <td className="px-4 py-4 font-mono text-xs text-slate-700">
                            {pid}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-base font-semibold text-slate-900">
              Status Approval
            </h2>
            <div className="mt-4 space-y-3">
              {mandorAppr && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      Approval Mandor
                    </p>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <span
                        className={`h-2 w-2 rounded-full ${toneDot(mandorAppr.tone)}`}
                      />
                      {mandorAppr.label}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{data.mandor_id}</p>
                </div>
              )}

              {adminAppr && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      Approval Admin
                    </p>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <span
                        className={`h-2 w-2 rounded-full ${toneDot(adminAppr.tone)}`}
                      />
                      {adminAppr.label}
                    </span>
                  </div>
                </div>
              )}

              {canAct ? (
                <>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={acting}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
                  >
                    Approve Pengiriman
                  </button>
                  <button
                    type="button"
                    onClick={handlePartial}
                    disabled={acting}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                  >
                    Partial Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectFull}
                    disabled={acting}
                    className="w-full rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Reject Pengiriman
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-500">
                  Pengiriman sudah diproses admin.
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg">
          <p
            className={
              toast.type === "success" ? "text-emerald-700" : "text-rose-700"
            }
          >
            {toast.message}
          </p>
        </div>
      )}
    </AppShell>
  );
}
