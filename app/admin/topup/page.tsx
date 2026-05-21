"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  createTopUp,
  fetchWalletDashboard,
  type WalletDashboard,
} from "@/lib/payment-api";

export default function AdminTopUpPage() {
  const router = useRouter();
  const [adminUserId, setAdminUserId] = useState("admin-utama");
  const [amountRupiah, setAmountRupiah] = useState("10000000");
  const [wallet, setWallet] = useState<WalletDashboard | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async (targetUserId = "admin-utama") => {
    try {
      const data = await fetchWalletDashboard(targetUserId);
      setWallet(data);
    } catch (walletError) {
      setError(walletError instanceof Error ? walletError.message : "Unexpected error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadWallet(), 0);
    return () => window.clearTimeout(timer);
  }, [loadWallet]);

  async function handleCreateTopUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creating top-up request...");
    setError(null);

    try {
      const response = await createTopUp({
        adminUserId,
        amountRupiah: Number(amountRupiah),
      });
      setStatus("Redirecting to mock payment gateway...");
      router.push(
        `/payment-gateway/mock/${encodeURIComponent(response.reference)}?userId=${encodeURIComponent(adminUserId)}`,
      );
    } catch (topUpError) {
      setStatus(null);
      setError(topUpError instanceof Error ? topUpError.message : "Unexpected error");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Admin Top-Up Wallet</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Pilih nominal top-up, lalu redirect ke mock gateway untuk mensimulasikan alur
                Xendit/Midtrans sandbox dan callback webhook.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/payroll"
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Payroll Desk
              </Link>
              <Link
                href="/"
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold">Company Wallet</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={adminUserId}
              onChange={(event) => setAdminUserId(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Admin wallet user ID"
            />
            <button
              type="button"
              onClick={() => void loadWallet(adminUserId)}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
            >
              Refresh Wallet
            </button>
          </div>
          <p className="mt-4 text-3xl font-semibold text-emerald-400">
            SD {wallet?.balance ?? "0.00"}
          </p>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold">Create Top-Up</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={handleCreateTopUp}>
            <input
              type="number"
              min="10000"
              step="10000"
              value={amountRupiah}
              onChange={(event) => setAmountRupiah(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Nominal Rupiah"
              required
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Bayar via Gateway
            </button>
          </form>
        </section>

        {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </main>
  );
}
