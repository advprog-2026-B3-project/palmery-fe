import { WalletDashboardClient } from "@/components/wallet-dashboard";

export const dynamic = "force-dynamic";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{
    userId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    topup?: string;
  }>;
}) {
  const filters = await searchParams;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_28%),linear-gradient(180deg,#130f0b,#090909_72%)] text-stone-100">
      <WalletDashboardClient
        initialUserId={filters.userId}
        initialStatus={filters.status}
        initialFromDate={filters.fromDate}
        initialToDate={filters.toDate}
        topUpSuccess={filters.topup === "success"}
      />
    </main>
  );
}
