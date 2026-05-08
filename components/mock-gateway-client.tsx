"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmTopUp } from "@/lib/payment-api";

type MockGatewayClientProps = {
  reference: string;
  userId: string;
};

export function MockGatewayClient({ reference, userId }: MockGatewayClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePaymentSuccess() {
    setStatus("Mengirim callback payment gateway...");
    setError(null);

    try {
      await confirmTopUp(reference);
      router.push(`/wallet?userId=${encodeURIComponent(userId)}&topup=success`);
    } catch (confirmError) {
      setStatus(null);
      setError(confirmError instanceof Error ? confirmError.message : "Unexpected error");
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#181412,#090909)] px-4 py-10 text-stone-100 sm:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-900/40 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_32%),linear-gradient(165deg,#1c150d,#0d0b09_70%)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">Mock Gateway</p>
        <h1 className="mt-3 text-3xl font-semibold">Sandbox Checkout</h1>
        <p className="mt-3 max-w-2xl text-sm text-stone-300">
          Ini adalah halaman simulasi gateway untuk milestone demo. Tombol bayar akan memicu webhook
          lalu mengarahkan kembali ke halaman wallet admin.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-stone-800 bg-black/20 p-5">
          <p className="text-sm text-stone-400">Reference</p>
          <p className="mt-2 text-xl font-semibold text-stone-100">{reference}</p>
          <p className="mt-3 text-sm text-stone-400">Metode simulasi: Virtual Account Sandbox</p>
        </div>

        <button
          type="button"
          onClick={() => void handlePaymentSuccess()}
          className="mt-8 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
        >
          Bayar sekarang
        </button>

        {status ? <p className="mt-4 text-sm text-emerald-300">{status}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </div>
    </main>
  );
}
