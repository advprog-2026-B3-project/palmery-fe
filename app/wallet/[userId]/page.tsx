import Link from "next/link";
import {
  fetchWalletDashboard,
  type PayrollHistoryItem,
  type WalletDashboard,
} from "@/lib/payment-api";

export const dynamic = "force-dynamic";

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

export default async function WalletUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  let data: WalletDashboard | null = null;
  let error: string | null = null;

  try {
    data = await fetchWalletDashboard(userId);
  } catch (fetchError) {
    error = fetchError instanceof Error ? fetchError.message : "Unexpected error";
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-2xl font-semibold">Wallet SawitDollar</h1>
          <p className="mt-2 text-sm text-zinc-300">
            User: <span className="font-medium text-zinc-100">{userId}</span>
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Back to Home
            </Link>
          </div>
        </header>

        {error ? (
          <section className="rounded-xl border border-rose-900 bg-zinc-900 p-6">
            <p className="text-sm text-rose-300">{error}</p>
          </section>
        ) : null}

        {data ? (
          <>
            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-300">Saldo</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-400">
                SawitDollar {formatAmount(data.balance)}
              </p>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold">Riwayat Payroll</h2>

              {data.payrollHistory.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-300">Belum ada riwayat payroll.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-700 text-left text-zinc-300">
                        <th className="pb-2 pr-3">Waktu</th>
                        <th className="pb-2 pr-3">Deskripsi</th>
                        <th className="pb-2 pr-3">Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payrollHistory.map((item: PayrollHistoryItem, index) => (
                        <tr key={`${item.paidAt}-${item.description}-${index}`} className="border-b border-zinc-800">
                          <td className="py-2 pr-3">{formatDate(item.paidAt)}</td>
                          <td className="py-2 pr-3">{item.description}</td>
                          <td className="py-2 pr-3">SawitDollar {formatAmount(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
