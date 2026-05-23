import { decodeToken, getToken, normalizeRole } from "@/lib/auth";

const MANAGE_API_BASE = process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL ?? "http://localhost:8081";
const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? "http://localhost:8080";
const PAYMENT_API_BASE = process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL ?? "http://localhost:8082";

function currentUser() {
  const token = getToken();
  return token ? decodeToken(token) : null;
}

function currentUserId(): string | null {
  return currentUser()?.sub ?? null;
}

function currentUserRole(): string | null {
  return normalizeRole(currentUser()?.role);
}

function isFormData(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildHeaders(init?: RequestInit, includeUserHeaders = false): Headers {
  const headers = new Headers(init?.headers);
  const token = getToken();

  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (!isFormData(init?.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (includeUserHeaders) {
    const userId = currentUserId();
    const role = currentUserRole();
    if (userId) headers.set("X-User-Id", userId);
    if (role) headers.set("X-User-Role", role);
  }

  return headers;
}

async function readError(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return `HTTP ${response.status}`;
  try {
    const payload = JSON.parse(text) as { message?: string; error?: string };
    return payload.message ?? payload.error ?? text;
  } catch {
    return text;
  }
}

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    throw new Error(await readError(response) || fallbackMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function fetchManage(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${MANAGE_API_BASE}${path}`, {
      ...init,
      headers: buildHeaders(init, true),
    });
  } catch {
    throw new Error(
      `Manage service at ${MANAGE_API_BASE} is unavailable or still starting. Retry in a moment if a deployment is in progress.`,
    );
  }
}

/**
 * Resolve photo URL to a fully-qualified URL pointing at the manage service.
 *
 * Server can return either a relative path (e.g. "/api/harvests/photos/xxx.jpg")
 * which is the proxy endpoint, or a legacy absolute URL pointing directly at MinIO.
 * Both are normalized to go through the manage proxy so the browser never hits
 * the private S3 bucket directly.
 */
export function resolvePhotoUrl(url?: string | null): string {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);

      if (parsed.pathname.startsWith("/api/harvests/photos/") || parsed.pathname.startsWith("/assets/")) {
        return url;
      }

      const legacyPathParts = parsed.pathname.split("/").filter(Boolean);
      if (legacyPathParts.length >= 2) {
        const objectKey = legacyPathParts.slice(1).join("/");
        return `${MANAGE_API_BASE}/api/harvests/photos/${objectKey}`;
      }
    } catch {
      return url;
    }
  }

  if (url.startsWith("/")) return `${MANAGE_API_BASE}${url}`;
  return url;
}

async function fetchAuth(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${AUTH_API_BASE}${path}`, {
      ...init,
      headers: buildHeaders(init),
    });
  } catch {
    throw new Error(`Cannot connect to auth service at ${AUTH_API_BASE}. Is the backend running?`);
  }
}

async function fetchPayment(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${PAYMENT_API_BASE}${path}`, {
      ...init,
      headers: buildHeaders(init),
    });
  } catch {
    throw new Error(`Cannot connect to payment service at ${PAYMENT_API_BASE}. Is the backend running?`);
  }
}

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
  return readJson(await fetchManage(`/kebun${query}`), "Failed to fetch plantations");
}

export async function getPlantationById(id: string): Promise<PlantationDetail> {
  return readJson(await fetchManage(`/kebun/${id}`), "Failed to fetch plantation");
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
  return readJson(
    await fetchManage("/kebun", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    "Failed to create plantation",
  );
}

export async function assignMandorToPlantation(plantationId: string, personnelId: string): Promise<void> {
  await readJson<void>(
    await fetchManage(`/kebun/${plantationId}/mandor`, {
      method: "POST",
      body: JSON.stringify({ personnelId }),
    }),
    "Failed to assign mandor",
  );
}

export async function assignSupirToPlantation(plantationId: string, personnelId: string): Promise<void> {
  await readJson<void>(
    await fetchManage(`/kebun/${plantationId}/supir`, {
      method: "POST",
      body: JSON.stringify({ personnelId }),
    }),
    "Failed to assign supir",
  );
}

export async function unassignMandorFromPlantation(plantationId: string, personnelId: string): Promise<void> {
  await readJson<void>(
    await fetchManage(`/kebun/${plantationId}/mandor`, {
      method: "DELETE",
      body: JSON.stringify({ personnelId }),
    }),
    "Failed to unassign mandor",
  );
}

export async function unassignSupirFromPlantation(plantationId: string, personnelId: string): Promise<void> {
  await readJson<void>(
    await fetchManage(`/kebun/${plantationId}/supir`, {
      method: "DELETE",
      body: JSON.stringify({ personnelId }),
    }),
    "Failed to unassign supir",
  );
}

export async function transferMandorBetweenPlantations(
  fromPlantationId: string,
  toPlantationId: string,
  personnelId: string,
): Promise<void> {
  await readJson<void>(
    await fetchManage(`/kebun/${fromPlantationId}/mandor/transfer`, {
      method: "POST",
      body: JSON.stringify({ personnelId, toPlantationId }),
    }),
    "Failed to transfer mandor",
  );
}

export async function transferSupirBetweenPlantations(
  fromPlantationId: string,
  toPlantationId: string,
  personnelId: string,
): Promise<void> {
  await readJson<void>(
    await fetchManage(`/kebun/${fromPlantationId}/supir/transfer`, {
      method: "POST",
      body: JSON.stringify({ personnelId, toPlantationId }),
    }),
    "Failed to transfer supir",
  );
}

export async function getPengirimanBySupirForMandor(
  supirId: string,
  filters?: { from?: string; to?: string },
): Promise<Pengiriman[]> {
  const params = new URLSearchParams();
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  const query = params.toString() ? `?${params.toString()}` : "";
  return readJson(
    await fetchManage(`/api/mandor/supir/${supirId}/pengiriman${query}`),
    "Failed to fetch pengiriman by supir",
  );
}

export type HarvestPhoto = {
  id?: string;
  url: string;
  filename: string;
  sizeBytes: number;
  uploadedAt?: string;
};

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
  photos: HarvestPhoto[];
};

export type SubmitHarvestRequest = {
  plantationId: string;
  mandorId: string;
  harvestDate: string;
  kgHarvested: number;
  notes: string;
  photos?: HarvestPhoto[];
};

export async function uploadHarvestPhoto(file: File): Promise<HarvestPhoto> {
  const formData = new FormData();
  formData.append("file", file);
  return readJson(
    await fetchManage("/api/harvests/photos", {
      method: "POST",
      body: formData,
    }),
    "Failed to upload photo",
  );
}

export async function submitHarvest(data: SubmitHarvestRequest): Promise<HarvestResult> {
  return readJson(
    await fetchManage("/api/harvests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    "Failed to submit harvest",
  );
}

export async function getHarvests(date?: string, workerId?: string): Promise<HarvestResult[]> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (workerId) params.set("workerId", workerId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return readJson(await fetchManage(`/api/harvests${query}`), "Failed to fetch harvests");
}

export async function getHarvestById(id: string): Promise<HarvestResult> {
  return readJson(await fetchManage(`/api/harvests/${id}`), "Failed to fetch harvest");
}

export async function getHarvestsByWorkerId(workerId: string): Promise<HarvestResult[]> {
  return readJson(
    await fetchManage(`/api/harvests/worker/${workerId}`),
    "Failed to fetch worker harvests",
  );
}

export async function getMyHarvests(filters?: { status?: string; start?: string; end?: string }): Promise<HarvestResult[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.start) params.set("start", filters.start);
  if (filters?.end) params.set("end", filters.end);
  const query = params.toString() ? `?${params.toString()}` : "";
  return readJson(await fetchManage(`/api/harvests/me${query}`), "Failed to fetch my harvests");
}

export async function hasSubmittedHarvestToday(): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const list = await getMyHarvests({ start: today, end: today });
  return list.length > 0;
}

export async function validateHarvest(
  id: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
): Promise<HarvestResult> {
  return readJson(
    await fetchManage(`/api/harvests/${id}/validate`, {
      method: "PATCH",
      body: JSON.stringify({ status, rejectionReason }),
    }),
    "Failed to validate harvest",
  );
}

export type ReadyHarvest = {
  id: string;
  berat_kg: number;
  kebun_id: string;
  buruh_id?: string;
  mandor_id?: string;
  tanggal_panen?: string;
  status?: string;
  berita_hasil_panen?: string;
};

export type DriverOption = {
  id: string;
  nama: string;
  kebun_id?: string;
  kontak?: string;
};

export type PengirimanStatus = "MEMUAT" | "MENGIRIM" | "TIBA_DI_TUJUAN";

export type Pengiriman = {
  id: string;
  supir_id: string;
  mandor_id: string;
  kebun_id: string;
  total_kg: number;
  status: PengirimanStatus;
  mandor_approval_status: string;
  admin_approval_status: string;
  panen_ids: string[];
  rejected_reason?: string;
  recognized_kg?: number;
  accepted_kg_by_admin?: number;
  created_at: string;
  updated_at: string;
};

export async function getDriversForMandor(search?: string): Promise<DriverOption[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return readJson(await fetchManage(`/api/mandor/drivers${params}`), "Failed to fetch drivers");
}

export async function getPanenSiapAngkut(): Promise<ReadyHarvest[]> {
  return readJson(await fetchManage("/api/mandor/panen/siap-angkut"), "Failed to fetch ready harvests");
}

export async function createPengiriman(supirId: string, panenIds: string[]): Promise<Pengiriman> {
  return readJson(
    await fetchManage("/api/mandor/pengiriman", {
      method: "POST",
      body: JSON.stringify({ supirId, panenIds }),
    }),
    "Failed to create pengiriman",
  );
}

export async function getActivePengirimanMandor(): Promise<Pengiriman[]> {
  return readJson(await fetchManage("/api/mandor/pengiriman/aktif"), "Failed to fetch mandor shipments");
}

export async function getActivePengirimanSupir(): Promise<Pengiriman[]> {
  return readJson(await fetchManage("/api/supir/pengiriman/aktif"), "Failed to fetch driver shipments");
}

export async function getRiwayatPengirimanSupir(from: string, to: string): Promise<Pengiriman[]> {
  const params = new URLSearchParams({ from, to });
  return readJson(await fetchManage(`/api/supir/pengiriman/riwayat?${params.toString()}`), "Failed to fetch driver history");
}

export async function getPengirimanById(id: string): Promise<Pengiriman> {
  const role = currentUserRole();
  const path = role === "SUPIR"
    ? `/api/supir/pengiriman/${id}`
    : role === "MANDOR"
      ? `/api/mandor/pengiriman/${id}`
      : `/api/admin/pengiriman/${id}`;
  return readJson(await fetchManage(path), "Failed to fetch pengiriman");
}

export async function getPendingPengiriman(mandor?: string, date?: string): Promise<Pengiriman[]> {
  const params = new URLSearchParams();
  if (mandor) params.set("mandor", mandor);
  if (date) params.set("date", date);
  const query = params.toString() ? `?${params.toString()}` : "";
  return readJson(await fetchManage(`/api/admin/pengiriman/pending${query}`), "Failed to fetch pending pengiriman");
}

export async function updatePengirimanStatus(id: string, status: PengirimanStatus): Promise<Pengiriman> {
  return readJson(
    await fetchManage(`/api/supir/pengiriman/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
    "Failed to update pengiriman status",
  );
}

export async function approvePengirimanByMandor(id: string): Promise<Pengiriman> {
  return readJson(
    await fetchManage(`/api/mandor/pengiriman/${id}/approve`, { method: "POST" }),
    "Failed to approve pengiriman by mandor",
  );
}

export async function rejectPengirimanByMandor(id: string, reason: string): Promise<Pengiriman> {
  return readJson(
    await fetchManage(`/api/mandor/pengiriman/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
    "Failed to reject pengiriman by mandor",
  );
}

export async function approvePengirimanByAdmin(id: string): Promise<Pengiriman> {
  return readJson(
    await fetchManage(`/api/admin/pengiriman/${id}/approve`, { method: "POST" }),
    "Failed to approve pengiriman by admin",
  );
}

export async function partiallyApprovePengirimanByAdmin(
  id: string,
  recognizedKg: number,
  reason: string,
): Promise<Pengiriman> {
  return readJson(
    await fetchManage(`/api/admin/pengiriman/${id}/partial-reject`, {
      method: "POST",
      body: JSON.stringify({ recognizedKg, reason }),
    }),
    "Failed to partially approve pengiriman",
  );
}

export async function rejectPengirimanByAdmin(id: string, reason: string): Promise<Pengiriman> {
  return readJson(
    await fetchManage(`/api/admin/pengiriman/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
    "Failed to reject pengiriman by admin",
  );
}

export type UserSummary = {
  id: string;
  nama: string;
  email: string;
  role: string;
  kontak: string;
};

export type UserDetail = UserSummary & {
  active: boolean;
  supervisorCertNumber?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export async function getUsersByRole(role: string): Promise<UserSummary[]> {
  return readJson(await fetchAuth(`/api/users?role=${encodeURIComponent(role)}`), "Failed to fetch users");
}

export async function searchUsers(filters: { name?: string; email?: string; role?: string }): Promise<UserSummary[]> {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.email) params.set("email", filters.email);
  if (filters.role) params.set("role", filters.role);
  const query = params.toString() ? `?${params.toString()}` : "";
  return readJson(await fetchAuth(`/api/users${query}`), "Failed to search users");
}

export async function getUserById(id: string): Promise<UserDetail> {
  return readJson(await fetchAuth(`/api/users/${id}`), "Failed to fetch user");
}

export async function deleteUser(id: string): Promise<void> {
  await readJson<void>(
    await fetchAuth(`/api/users/${id}`, { method: "DELETE" }),
    "Failed to delete user",
  );
}

export async function getUsersByIds(ids: string[]): Promise<UserSummary[]> {
  if (ids.length === 0) return [];
  return readJson(
    await fetchAuth("/api/users/by-ids", {
      method: "POST",
      body: JSON.stringify(ids),
    }),
    "Failed to fetch users by ids",
  );
}

// === Worker ↔ Mandor assignment ===

export type WorkerAssignment = {
  workerId: string;
  mandorId: string;
  assignedAt: string;
  updatedAt: string;
};

export async function assignWorkerToMandor(workerId: string, mandorId: string): Promise<WorkerAssignment> {
  return readJson(
    await fetchManage("/api/admin/worker-assignments", {
      method: "POST",
      body: JSON.stringify({ workerId, mandorId }),
    }),
    "Failed to assign worker",
  );
}

export async function unassignWorker(workerId: string): Promise<void> {
  await readJson<void>(
    await fetchManage(`/api/admin/worker-assignments/${workerId}`, { method: "DELETE" }),
    "Failed to unassign worker",
  );
}

export async function getAllWorkerAssignments(): Promise<WorkerAssignment[]> {
  return readJson(
    await fetchManage("/api/admin/worker-assignments"),
    "Failed to fetch worker assignments",
  );
}

export async function getWorkersForMandor(mandorId: string): Promise<WorkerAssignment[]> {
  return readJson(
    await fetchManage(`/api/admin/worker-assignments/by-mandor/${mandorId}`),
    "Failed to fetch workers for mandor",
  );
}

export async function getMyAssignedWorkers(): Promise<WorkerAssignment[]> {
  return readJson(
    await fetchManage("/api/mandor/workers"),
    "Failed to fetch my workers",
  );
}

export async function getWorkerAssignment(workerId: string): Promise<WorkerAssignment | null> {
  const response = await fetchManage(`/api/admin/worker-assignments/by-worker/${workerId}`);
  if (response.status === 404) return null;
  return readJson(response, "Failed to fetch worker assignment");
}

export type PayrollSummary = {
  id: number;
  userId: string;
  type: string;
  status: "PENDING" | "ACCEPTED" | "APPROVED" | "REJECTED" | string;
  amount: number;
  quantityKg: number;
  ratePerKg: number;
  description: string;
  calculationDetail?: string;
  sourceType?: "HASIL_PANEN" | "PENGIRIMAN" | string;
  sourceId?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
  userName?: string;
};

export async function getPayrolls(status?: string, userId?: string): Promise<PayrollSummary[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (userId) params.set("userId", userId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return readJson(await fetchPayment(`/api/payrolls${query}`), "Failed to fetch payrolls");
}

export async function approvePayroll(payrollId: number, _adminUserId: string): Promise<PayrollSummary> {
  return readJson(
    await fetchPayment(`/api/payrolls/${payrollId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({}),
    }),
    "Failed to approve payroll",
  );
}

export async function rejectPayroll(payrollId: number, reason: string): Promise<PayrollSummary> {
  return readJson(
    await fetchPayment(`/api/payrolls/${payrollId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
    "Failed to reject payroll",
  );
}

export type WalletDashboard = {
  userId: string;
  balance: number;
  payrollHistory: {
    id: number;
    type: string;
    status: string;
    amount: number;
    description: string;
    quantityKg?: number;
    ratePerKg?: number;
    calculationDetail?: string;
    rejectionReason?: string;
    createdAt: string;
    processedAt?: string;
  }[];
};

export async function getWallet(userId: string, status?: string, fromDate?: string, toDate?: string): Promise<WalletDashboard> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  return readJson(await fetchPayment(`/api/wallets/${userId}${query}`), "Failed to fetch wallet");
}

export type WageConfig = {
  buruhRatePerKg: number;
  supirRatePerKg: number;
  mandorRatePerKg: number;
};

export async function getWageConfig(): Promise<WageConfig> {
  return readJson(await fetchPayment("/api/admin/config/wages"), "Failed to fetch wage config");
}

export async function updateWageConfig(data: Partial<WageConfig>): Promise<WageConfig> {
  return readJson(
    await fetchPayment("/api/admin/config/wages", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    "Failed to update wage config",
  );
}

export type TopUpResult = {
  reference: string;
  adminUserId: string;
  amountRupiah: number;
  creditedAmount: number;
  status: string;
  gatewayUrl?: string;
  createdAt: string;
  paidAt?: string;
};

export async function createTopUp(
  _adminUserId: string,
  amountSawitDollar: number,
  paymentMethod: string,
): Promise<TopUpResult> {
  return readJson(
    await fetchPayment("/api/payments/create", {
      method: "POST",
      body: JSON.stringify({
        amountRupiah: amountSawitDollar * 10000,
        paymentMethod,
      }),
    }),
    "Failed to create top-up",
  );
}
