import DashboardLayout from "@/components/DashboardLayout";

export default function SawitBidPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">SawitBid Auctions</h1>
        <p className="text-[var(--color-text-muted)]">
          Platform lelang komoditas sawit real-time.
        </p>
        <div className="mt-8 bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
          <p className="text-[var(--color-text-muted)]">Coming soon - fitur lelang dalam pengembangan.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
