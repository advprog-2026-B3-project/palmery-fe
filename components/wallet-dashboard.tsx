"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchWalletDashboard,
  type PayrollHistoryItem,
  type WalletDashboard,
} from "@/lib/payment-api";

type WalletDashboardClientProps = {
  initialUserId?: string;
  initialStatus?: string;
  initialFromDate?: string;
  initialToDate?: string;
  topUpSuccess?: boolean;
};

type FilterState = {
  userId: string;
  status: string;
  fromDate: string;
  toDate: string;
};

function formatAmount(value: number | string): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }
  return numeric.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("id-ID");
}

export function WalletDashboardClient({
  initialUserId,
  initialStatus,
  initialFromDate,
  initialToDate,
  topUpSuccess,
}: WalletDashboardClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    userId: initialUserId || "buruh-demo",
    status: initialStatus || "",
    fromDate: initialFromDate || "",
    toDate: initialToDate || "",
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    userId: initialUserId || "buruh-demo",
    status: initialStatus || "",
    fromDate: initialFromDate || "",
    toDate: initialToDate || "",
  });
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollHistoryItem | null>(null);
  const [wallet, setWallet] = useState<WalletDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      setLoading(true);
      setError(null);

      try {
        const nextWallet = await fetchWalletDashboard(appliedFilters.userId, {
          status: appliedFilters.status || undefined,
          fromDate: appliedFilters.fromDate || undefined,
          toDate: appliedFilters.toDate || undefined,
        });
        if (active) {
          setWallet(nextWallet);
          setSelectedPayroll((currentSelectedPayroll) =>
            currentSelectedPayroll
              ? nextWallet.payrollHistory.find((item) => item.id === currentSelectedPayroll.id) ?? null
              : nextWallet.payrollHistory[0] ?? null,
          );
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unexpected error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWallet();

    return () => {
      active = false;
    };
  }, [appliedFilters]);

  function applyFilters() {
    setAppliedFilters(filters);
    const params = new URLSearchParams();
    params.set("userId", filters.userId);
    if (filters.status) {
      params.set("status", filters.status);
    }
    if (filters.fromDate) {
      params.set("fromDate", filters.fromDate);
    }
    if (filters.toDate) {
      params.set("toDate", filters.toDate);
    }
    router.replace(`/wallet?${params.toString()}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-amber-900/40 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_35%),linear-gradient(160deg,#1a140d,#0b0a09_72%)] p-6 text-stone-100 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">SawitDollar</p>
            <h1 className="mt-3 text-3xl font-semibold">Dompet Digital</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-300">
              Pantau saldo, filter riwayat payroll, lalu klik satu baris untuk melihat kalkulasi transparannya.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-400/20 bg-black/25 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Saldo aktif</p>
            <p className="mt-2 text-4xl font-semibold text-emerald-300">
              SD {formatAmount(wallet?.balance ?? "0")}
            </p>
            <p className="mt-2 text-sm text-stone-400">{filters.userId}</p>
          </div>
        </div>

        {topUpSuccess ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Top-up berhasil dikonfirmasi. Saldo wallet telah diperbarui.
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[1.75rem] border border-stone-800 bg-[linear-gradient(180deg,#151311,#0e0d0c)] p-6 text-stone-100">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={filters.userId}
              onChange={(event) => setFilters({ ...filters, userId: event.target.value })}
              className="rounded-2xl border border-stone-700 bg-stone-950/90 px-4 py-3 text-sm outline-none transition focus:border-amber-400/60"
              placeholder="User ID"
            />
            <select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              className="rounded-2xl border border-stone-700 bg-stone-950/90 px-4 py-3 text-sm outline-none transition focus:border-amber-400/60"
            >
              <option value="">Semua status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) => setFilters({ ...filters, fromDate: event.target.value })}
              className="rounded-2xl border border-stone-700 bg-stone-950/90 px-4 py-3 text-sm outline-none transition focus:border-amber-400/60"
            />
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) => setFilters({ ...filters, toDate: event.target.value })}
              className="rounded-2xl border border-stone-700 bg-stone-950/90 px-4 py-3 text-sm outline-none transition focus:border-amber-400/60"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Terapkan filter
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({
                  userId: filters.userId,
                  status: "",
                  fromDate: "",
                  toDate: "",
                });
                setAppliedFilters({
                  userId: filters.userId,
                  status: "",
                  fromDate: "",
                  toDate: "",
                });
                router.replace(`/wallet?userId=${encodeURIComponent(filters.userId)}`);
              }}
              className="rounded-full border border-stone-700 px-5 py-2.5 text-sm text-stone-200 transition hover:border-stone-500 hover:bg-stone-900"
            >
              Reset
            </button>
          </div>

          {loading ? <p className="mt-5 text-sm text-stone-400">Memuat riwayat payroll...</p> : null}
          {error ? <p className="mt-5 text-sm text-rose-300">{error}</p> : null}

          {!loading && wallet?.payrollHistory.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-stone-700 px-4 py-8 text-center text-sm text-stone-400">
              Belum ada riwayat payroll untuk filter ini.
            </div>
          ) : null}

          {!loading && wallet && wallet.payrollHistory.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-stone-800">
              <div className="grid grid-cols-[110px_120px_1fr_150px] gap-3 border-b border-stone-800 bg-stone-900/80 px-4 py-3 text-xs uppercase tracking-[0.22em] text-stone-400">
                <span>Role</span>
                <span>Status</span>
                <span>Deskripsi</span>
                <span>Nominal</span>
              </div>
              <div className="divide-y divide-stone-800">
                {wallet.payrollHistory.map((item) => {
                  const active = selectedPayroll?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPayroll(item)}
                      className={`grid w-full grid-cols-[110px_120px_1fr_150px] gap-3 px-4 py-4 text-left transition ${
                        active
                          ? "bg-amber-400/10"
                          : "bg-transparent hover:bg-stone-900/70"
                      }`}
                    >
                      <span className="text-sm font-semibold text-stone-200">{item.type}</span>
                      <span
                        className={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          item.status === "APPROVED"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : item.status === "REJECTED"
                              ? "bg-rose-400/15 text-rose-300"
                              : "bg-stone-700/60 text-stone-200"
                        }`}
                      >
                        {item.status}
                      </span>
                      <div>
                        <p className="text-sm text-stone-100">{item.description}</p>
                        <p className="mt-1 text-xs text-stone-400">{formatDate(item.createdAt)}</p>
                      </div>
                      <span className="text-sm font-semibold text-amber-100">
                        SD {formatAmount(item.amount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="rounded-[1.75rem] border border-stone-800 bg-[linear-gradient(180deg,#141211,#0b0b0a)] p-6 text-stone-100">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Detail kalkulasi</p>
          {selectedPayroll ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-2xl font-semibold text-amber-100">{selectedPayroll.description}</p>
                <p className="mt-2 text-sm text-stone-400">{formatDate(selectedPayroll.createdAt)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
                  <p className="text-stone-400">Role</p>
                  <p className="mt-2 font-semibold">{selectedPayroll.type}</p>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
                  <p className="text-stone-400">Nominal</p>
                  <p className="mt-2 font-semibold text-emerald-300">SD {formatAmount(selectedPayroll.amount)}</p>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
                  <p className="text-stone-400">Kg</p>
                  <p className="mt-2 font-semibold">{formatAmount(selectedPayroll.quantityKg)}</p>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
                  <p className="text-stone-400">Tarif / Kg</p>
                  <p className="mt-2 font-semibold">SD {formatAmount(selectedPayroll.ratePerKg)}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-amber-500/15 bg-amber-500/8 p-4 text-sm text-stone-200">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Formula</p>
                <p className="mt-2 font-medium">{selectedPayroll.calculationDetail}</p>
                {selectedPayroll.rejectionReason ? (
                  <p className="mt-3 text-rose-300">Alasan penolakan: {selectedPayroll.rejectionReason}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-stone-700 px-4 py-8 text-sm text-stone-400">
              Klik satu baris payroll untuk membuka detail kalkulasinya.
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
