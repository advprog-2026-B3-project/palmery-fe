export type PayrollHistoryItem = {
  amount: number | string;
  description: string;
  paidAt: string;
};

export type WalletDashboard = {
  userId: string;
  balance: number | string;
  payrollHistory: PayrollHistoryItem[];
};

const PAYMENT_API_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL ?? "http://localhost:8082";

export async function fetchWalletDashboard(userId: string): Promise<WalletDashboard> {
  const response = await fetch(
    `${PAYMENT_API_BASE}/api/wallets/${encodeURIComponent(userId)}`,
    { cache: "no-store" },
  );

  const data = (await response.json().catch(() => ({}))) as WalletDashboard;
  if (!response.ok) {
    throw new Error(`Failed to fetch wallet dashboard (${response.status})`);
  }

  return {
    userId: data.userId ?? userId,
    balance: data.balance ?? 0,
    payrollHistory: Array.isArray(data.payrollHistory) ? data.payrollHistory : [],
  };
}
