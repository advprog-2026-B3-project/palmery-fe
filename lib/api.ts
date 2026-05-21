import { getToken, decodeToken } from "@/lib/auth";

const MANAGE_API_BASE = process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL ?? "http://localhost:8081";
const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? "http://localhost:8080";

function getUserId(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  return payload?.sub ?? null;
}

function getUserRole(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  return payload?.role ?? null;
}

async function fetchManage(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const userId = getUserId();
  const userRole = getUserRole();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (userId) headers["X-User-Id"] = userId;
  if (userRole) headers["X-User-Role"] = userRole;

  try {
    return await fetch(`${MANAGE_API_BASE}${path}`, { ...init, headers });
  } catch (err) {
    throw new Error(`Cannot connect to manage service at ${MANAGE_API_BASE}. Is the backend running?`);
  }
}

async function fetchAuth(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    return await fetch(`${AUTH_API_BASE}${path}`, { ...init, headers });
  } catch (err) {
    throw new Error(`Cannot connect to auth service at ${AUTH_API_BASE}. Is the backend running?`);
  }
}

// ─── Plantation (Kebun) ───────────────────────────────────────────────────────

export type PlantationSummary = {
  id: string;
  name: string;
  code: string;
  areaHa: number;
  isActive: boolean;
};

export type PlantationDetail = PlantationSummary & {
  coordTlLat: number;
  coordTlLon: number;
  coordTrLat: number;
  coordTrLon: number;
  coordBrLat: number;
  coordBrLon: number;
  coordBlLat: number;
  coordBlLon: number;
  createdAt: string;
  updatedAt: string;
  assignedMandorIds: string[];
  assignedSupirIds: string[];
};

export async function getPlantations(name?: string, code?: string): Promise<PlantationSummary[]> {
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (code) params.set("code", code);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetchManage(`/kebun${query}`);
  if (!res.ok) throw new Error(`Failed to fetch plantations: ${res.status}`);
  return res.json();
}

export async function getPlantationById(id: string): Promise<PlantationDetail> {
  const res = await fetchManage(`/kebun/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch plantation: ${res.status}`);
  return res.json();
}

export type CreatePlantationRequest = {
  name: string;
  code: string;
  areaHa: number;
  coordTlLat: number;
  coordTlLon: number;
  coordTrLat: number;
  coordTrLon: number;
  coordBrLat: number;
  coordBrLon: number;
  coordBlLat: number;
  coordBlLon: number;
};

export async function createPlantation(data: CreatePlantationRequest): Promise<PlantationDetail> {
  const res = await fetchManage("/kebun", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to create plantation: ${res.status}`);
  }
  return res.json();
}

// ─── Harvest (Panen) ──────────────────────────────────────────────────────────

export type HarvestResult = {
  id: string;
  workerId: string;
  mandorId: string;
  plantationId: string;
  harvestDate: string;
  kgHarvested: number;
  notes: string;
  status: string;
  rejectionReason?: string;
  readyForDelivery: boolean;
  validatedAt?: string;
  createdAt: string;
  photos: { url: string; filename: string; sizeBytes: number }[];
};

export type SubmitHarvestRequest = {
  plantationId: string;
  mandorId: string;
  harvestDate: string;
  kgHarvested: number;
  notes: string;
};

export async function submitHarvest(data: SubmitHarvestRequest): Promise<HarvestResult> {
  const res = await fetchManage("/api/harvests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to submit harvest: ${res.status}`);
  }
  return res.json();
}

export async function getHarvests(): Promise<HarvestResult[]> {
  const res = await fetchManage("/api/harvests");
  if (!res.ok) throw new Error(`Failed to fetch harvests: ${res.status}`);
  return res.json();
}

export async function getHarvestById(id: string): Promise<HarvestResult> {
  const res = await fetchManage(`/api/harvests/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch harvest: ${res.status}`);
  return res.json();
}

export async function getMyHarvests(): Promise<HarvestResult[]> {
  const res = await fetchManage("/api/harvests/me");
  if (!res.ok) throw new Error(`Failed to fetch my harvests: ${res.status}`);
  return res.json();
}

// ─── Pengiriman (Logistics) ───────────────────────────────────────────────────

export type Pengiriman = {
  id: string;
  supir_id: string;
  mandor_id: string;
  kebun_id: string;
  total_kg: number;
  status: string;
  mandor_approval_status: string;
  admin_approval_status: string;
  panen_ids: string[];
  rejected_reason?: string;
  recognized_kg?: number;
  accepted_kg_by_admin?: number;
  created_at: string;
  updated_at: string;
};

export async function getDriversForMandor(search?: string): Promise<{ id: string; nama: string }[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetchManage(`/api/mandor/drivers${params}`);
  if (!res.ok) throw new Error(`Failed to fetch drivers: ${res.status}`);
  return res.json();
}

export async function getPanenSiapAngkut(): Promise<{ id: string; berat_kg: number; kebun_id: string }[]> {
  const res = await fetchManage("/api/mandor/panen/siap-angkut");
  if (!res.ok) throw new Error(`Failed to fetch ready harvests: ${res.status}`);
  return res.json();
}

export async function createPengiriman(supirId: string, panenIds: string[]): Promise<Pengiriman> {
  const res = await fetchManage("/api/mandor/pengiriman", {
    method: "POST",
    body: JSON.stringify({ supirId, panenIds }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to create pengiriman: ${res.status}`);
  }
  return res.json();
}

export async function getActivePengirimanMandor(): Promise<Pengiriman[]> {
  const res = await fetchManage("/api/mandor/pengiriman/aktif");
  if (!res.ok) throw new Error(`Failed to fetch active pengiriman: ${res.status}`);
  return res.json();
}

export async function getPengirimanById(id: string): Promise<Pengiriman> {
  const res = await fetchManage(`/api/admin/pengiriman/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch pengiriman: ${res.status}`);
  return res.json();
}

export async function getPendingPengiriman(): Promise<Pengiriman[]> {
  const res = await fetchManage("/api/admin/pengiriman/pending");
  if (!res.ok) throw new Error(`Failed to fetch pending pengiriman: ${res.status}`);
  return res.json();
}

// ─── Users (from auth service) ────────────────────────────────────────────────

export type UserSummary = {
  id: string;
  nama: string;
  email: string;
  role: string;
  kontak: string;
};

export async function getUsersByRole(role: string): Promise<UserSummary[]> {
  const res = await fetchAuth(`/api/users?role=${encodeURIComponent(role)}`);
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  return res.json();
}

export async function getUsersByIds(ids: string[]): Promise<UserSummary[]> {
  const res = await fetchAuth("/api/users/by-ids", {
    method: "POST",
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error(`Failed to fetch users by ids: ${res.status}`);
  return res.json();
}

// ─── Payment Service ──────────────────────────────────────────────────────────

const PAYMENT_API_BASE = process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL ?? "http://localhost:8082";

async function fetchPayment(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    return await fetch(`${PAYMENT_API_BASE}${path}`, { ...init, headers });
  } catch (err) {
    throw new Error(`Cannot connect to payment service at ${PAYMENT_API_BASE}. Is the backend running?`);
  }
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

export type PayrollSummary = {
  id: number;
  userId: string;
  userName: string;
  role: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  reason?: string;
};

export async function getPayrolls(status?: string, userId?: string): Promise<PayrollSummary[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (userId) params.set("userId", userId);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetchPayment(`/api/payrolls${query}`);
  if (!res.ok) throw new Error(`Failed to fetch payrolls: ${res.status}`);
  return res.json();
}

export async function approvePayroll(payrollId: number, adminUserId: string): Promise<PayrollSummary> {
  const res = await fetchPayment(`/api/payrolls/${payrollId}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ adminUserId }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to approve payroll: ${res.status}`);
  }
  return res.json();
}

export async function rejectPayroll(payrollId: number, reason: string): Promise<PayrollSummary> {
  const res = await fetchPayment(`/api/payrolls/${payrollId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to reject payroll: ${res.status}`);
  }
  return res.json();
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export type WalletDashboard = {
  userId: string;
  balance: number;
  payrollHistory: { id: number; amount: number; status: string; description: string; createdAt: string }[];
};

export async function getWallet(userId: string, status?: string, fromDate?: string, toDate?: string): Promise<WalletDashboard> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetchPayment(`/api/wallets/${userId}${query}`);
  if (!res.ok) throw new Error(`Failed to fetch wallet: ${res.status}`);
  return res.json();
}

// ─── Wage Config ──────────────────────────────────────────────────────────────

export type WageConfig = {
  buruhPerKg: number;
  supirPerKg: number;
  mandorPerKg: number;
};

export async function getWageConfig(): Promise<WageConfig> {
  const res = await fetchPayment("/api/admin/config/wages");
  if (!res.ok) throw new Error(`Failed to fetch wage config: ${res.status}`);
  return res.json();
}

export async function updateWageConfig(data: Partial<WageConfig>): Promise<WageConfig> {
  const res = await fetchPayment("/api/admin/config/wages", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to update wage config: ${res.status}`);
  }
  return res.json();
}

// ─── Top Up (Payment Gateway) ─────────────────────────────────────────────────

export type TopUpResult = {
  id: number;
  reference: string;
  amountSawitDollar: number;
  amountIdr: number;
  status: string;
  paymentUrl?: string;
};

export async function createTopUp(userId: string, amountSawitDollar: number): Promise<TopUpResult> {
  const res = await fetchPayment("/api/payments/create", {
    method: "POST",
    body: JSON.stringify({ userId, amountSawitDollar }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to create top-up: ${res.status}`);
  }
  return res.json();
}
