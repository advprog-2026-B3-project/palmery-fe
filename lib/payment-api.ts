export type PayrollHistoryItem = {
  id: number;
  type: string;
  status: string;
  amount: number | string;
  description: string;
  quantityKg: number | string;
  ratePerKg: number | string;
  calculationDetail: string;
  rejectionReason?: string | null;
  createdAt: string;
  processedAt?: string | null;
};

export type WalletDashboard = {
  userId: string;
  balance: number | string;
  payrollHistory: PayrollHistoryItem[];
};

export type PayrollSummary = PayrollHistoryItem & {
  userId: string;
};

export type WageConfig = {
  buruhRatePerKg: number | string;
  supirRatePerKg: number | string;
  mandorRatePerKg: number | string;
};

export type TopUpView = {
  reference: string;
  adminUserId: string;
  amountRupiah: number | string;
  creditedAmount: number | string;
  status: string;
  gatewayUrl: string;
  createdAt: string;
  paidAt?: string | null;
};

export type NotificationItem = {
  id: number;
  userId: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  createdAt: string;
  readAt?: string | null;
};

export type NotificationInbox = {
  userId: string;
  unreadCount: number;
  notifications: NotificationItem[];
};

const PAYMENT_API_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL ?? "http://localhost:8082";
const PAYMENT_WEBHOOK_SECRET =
  process.env.NEXT_PUBLIC_PAYMENT_WEBHOOK_SECRET ?? "dev-topup-secret";

type WalletFilters = {
  status?: string;
  fromDate?: string;
  toDate?: string;
};

function buildUrl(path: string, params?: Record<string, string | undefined>): string {
  const url = new URL(`${PAYMENT_API_BASE}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function readJson<T>(response: Response, fallback: T): Promise<T> {
  return (await response.json().catch(() => fallback)) as T;
}

export async function fetchWalletDashboard(
  userId: string,
  filters?: WalletFilters,
): Promise<WalletDashboard> {
  const response = await fetch(buildUrl(`/api/wallets/${encodeURIComponent(userId)}`, filters), {
    cache: "no-store",
  });

  const data = await readJson<Partial<WalletDashboard>>(response, {});
  if (!response.ok) {
    throw new Error("Failed to fetch wallet dashboard");
  }

  return {
    userId: data.userId ?? userId,
    balance: data.balance ?? 0,
    payrollHistory: Array.isArray(data.payrollHistory) ? data.payrollHistory : [],
  };
}

export async function fetchPayrolls(filters?: {
  status?: string;
  userId?: string;
}): Promise<PayrollSummary[]> {
  const response = await fetch(buildUrl("/api/payrolls", filters), { cache: "no-store" });
  const data = await readJson<PayrollSummary[]>(response, []);
  if (!response.ok) {
    throw new Error("Failed to load payrolls");
  }
  return Array.isArray(data) ? data : [];
}

export async function generatePayrollDraft(payload: {
  userId: string;
  role: string;
  quantityKg: number;
  description?: string;
}): Promise<PayrollSummary> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/payrolls/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readJson<Record<string, unknown>>(response, {});
  if (!response.ok) {
    throw new Error(String(data.message ?? "Failed to generate payroll"));
  }
  return data as unknown as PayrollSummary;
}

export async function approvePayroll(payrollId: number, adminUserId: string): Promise<PayrollSummary> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/payrolls/${payrollId}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminUserId }),
  });
  const data = await readJson<Record<string, unknown>>(response, {});
  if (!response.ok) {
    throw new Error(String(data.message ?? "Failed to approve payroll"));
  }
  return data as unknown as PayrollSummary;
}

export async function rejectPayroll(payrollId: number, reason: string): Promise<PayrollSummary> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/payrolls/${payrollId}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const data = await readJson<Record<string, unknown>>(response, {});
  if (!response.ok) {
    throw new Error(String(data.message ?? "Failed to reject payroll"));
  }
  return data as unknown as PayrollSummary;
}

export async function fetchWageConfig(): Promise<WageConfig> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/admin/config/wages`, {
    cache: "no-store",
  });
  const data = await readJson<Partial<WageConfig>>(response, {});
  if (!response.ok) {
    throw new Error("Failed to load wage config");
  }
  return {
    buruhRatePerKg: data.buruhRatePerKg ?? 0,
    supirRatePerKg: data.supirRatePerKg ?? 0,
    mandorRatePerKg: data.mandorRatePerKg ?? 0,
  };
}

export async function updateWageConfig(payload: {
  buruhRatePerKg: number;
  supirRatePerKg: number;
  mandorRatePerKg: number;
}): Promise<WageConfig> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/admin/config/wages`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readJson<Record<string, unknown>>(response, {});
  if (!response.ok) {
    throw new Error(String(data.message ?? "Failed to update wage config"));
  }
  return data as unknown as WageConfig;
}

export async function createTopUp(payload: {
  adminUserId: string;
  amountRupiah: number;
}): Promise<TopUpView> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readJson<Record<string, unknown>>(response, {});
  if (!response.ok) {
    throw new Error(String(data.message ?? "Failed to create top-up"));
  }
  return data as unknown as TopUpView;
}

export async function confirmTopUp(reference: string): Promise<TopUpView> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Secret": PAYMENT_WEBHOOK_SECRET,
    },
    body: JSON.stringify({ reference, status: "paid" }),
  });
  const data = await readJson<Record<string, unknown>>(response, {});
  if (!response.ok) {
    throw new Error(String(data.message ?? "Failed to confirm top-up"));
  }
  return data as unknown as TopUpView;
}

export async function fetchNotifications(userId: string): Promise<NotificationInbox> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/notif/me`, {
    cache: "no-store",
    headers: {
      "X-User-Id": userId,
    },
  });
  const data = await readJson<Partial<NotificationInbox>>(response, {});
  if (!response.ok) {
    throw new Error("Failed to load notifications");
  }
  return {
    userId: data.userId ?? userId,
    unreadCount: Number(data.unreadCount ?? 0),
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
  };
}

export async function markNotificationAsRead(
  notificationId: number,
  userId: string,
): Promise<NotificationItem> {
  const response = await fetch(`${PAYMENT_API_BASE}/api/notif/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
  });
  const data = await readJson<Record<string, unknown>>(response, {});
  if (!response.ok) {
    throw new Error(String(data.message ?? "Failed to update notification"));
  }
  return data as unknown as NotificationItem;
}
