"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Pengiriman,
  SupirDriver,
  fetchDrivers,
  fetchPengirimanBySupirForMandor,
} from "@/lib/manage-pengiriman-api";
import { AppShell } from "@/components/AppShell";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function MandorSupirProfilPage() {
  const params = useParams<{ id: string }>();
  const supirId = params?.id ?? "";
  const [driver, setDriver] = useState<SupirDriver | null>(null);
  const [riwayat, setRiwayat] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    async function load() {
      if (!supirId) return;
      setLoading(true);
      try {
        const [drivers, history] = await Promise.all([
          fetchDrivers(""),
          fetchPengirimanBySupirForMandor(supirId, {
            from: "2000-01-01",
            to: new Date().toISOString().slice(0, 10),
          }),
        ]);
        setDriver(drivers.find((d) => d.id === supirId) ?? null);
        setRiwayat(history);
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
    <AppShell section="Pengiriman" userLabel="Mandor" userInitials="M">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Pengguna Detail Supir
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Detail supir dan riwayat pengirimannya.
          </p>
        </div>
        <Link
          href="/mandor"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Kembali
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-500">Memuat data supir...</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
            {driver ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                    {driver.nama
                      .split(" ")
                      .slice(0, 2)
                      .map((s) => s[0]?.toUpperCase())
                      .join("")}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {driver.nama}
                    </h2>
                    <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Supir
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {driver.kontak || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Informasi Kendaraan
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">ID Supir</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {driver.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Kebun</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {driver.kebun_id}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-500">Data supir tidak ditemukan.</p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
              Riwayat Pengiriman
            </h2>
            <div className="mt-4 space-y-3">
              {riwayat.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Belum ada riwayat pengiriman.
                </p>
              ) : (
                riwayat.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {new Date(item.created_at).toLocaleDateString("id-ID")}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                          {item.id}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Berat</p>
                        <p className="font-semibold text-slate-900">
                          {item.total_kg} kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Kebun</p>
                        <p className="font-semibold text-slate-900">
                          {item.kebun_id}
                        </p>
                      </div>
                    </div>
                    {item.rejected_reason && (
                      <p className="mt-2 text-xs text-rose-600">
                        Alasan: {item.rejected_reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

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
