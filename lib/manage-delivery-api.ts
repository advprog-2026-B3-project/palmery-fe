export type DeliveryStatus =
  | "MEMUAT"
  | "MENGIRIM"
  | "TIBA_DI_TUJUAN"
  | "PENDING_MANDOR_REVIEW"
  | "APPROVED_MANDOR"
  | "REJECTED_MANDOR"
  | "PENDING_ADMIN_REVIEW"
  | "APPROVED_ADMIN"
  | "REJECTED_ADMIN"
  | "PARTIAL_REJECTED_ADMIN";

export type Delivery = {
  id: string;
  supir_id: string;
  mandor_id: string;
  kebun_id: string;
  total_kg: number;
  status: DeliveryStatus;
  panen_ids: string[];
  rejected_reason: string | null;
  recognized_kg: number | null;
  created_at: string;
  updated_at: string;
};

export type Driver = {
  id: string;
  nama: string;
  kebun_id: string;
  kontak: string;
};

export type HarvestSummary = {
  id: string;
  berat_kg: number;
  kebun_id: string;
  mandor_id: string;
  status: string;
};

const MANAGE_BASE =
  process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL ?? "http://localhost:8081";

async function requestManage<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${MANAGE_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok) {
    let message = "Terjadi kesalahan. Silakan coba lagi.";
    if (data && typeof data === "object" && "message" in data) {
      const m = (data as { message?: unknown }).message;
      if (typeof m === "string" && m.trim().length > 0) {
        message = m;
      }
    }
    throw new Error(message);
  }

  return data as T;
}

// Supir

export async function fetchPengirimanAktifSupir(): Promise<Delivery[]> {
  return requestManage<Delivery[]>("/api/supir/pengiriman/aktif");
}

export async function fetchRiwayatSupir(params: {
  from: string;
  to: string;
}): Promise<Delivery[]> {
  const search = new URLSearchParams(params).toString();
  return requestManage<Delivery[]>(`/api/supir/pengiriman/riwayat?${search}`);
}

export async function updateStatusSupir(pengirimanId: string, status: DeliveryStatus) {
  return requestManage<Delivery>(`/api/supir/pengiriman/${pengirimanId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Mandor

export async function fetchDrivers(search: string): Promise<Driver[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return requestManage<Driver[]>(`/api/mandor/drivers${qs}`);
}

export async function fetchPanenSiapAngkut(): Promise<HarvestSummary[]> {
  return requestManage<HarvestSummary[]>("/api/mandor/panen/siap-angkut");
}

export async function createPengirimanBaru(payload: {
  supirId: string;
  panenIds: string[];
}) {
  return requestManage<Delivery>("/api/mandor/pengiriman", {
    method: "POST",
    body: JSON.stringify({
      supirId: payload.supirId,
      panenIds: payload.panenIds,
    }),
  });
}

export async function fetchPengirimanAktifMandor(): Promise<Delivery[]> {
  return requestManage<Delivery[]>("/api/mandor/pengiriman/aktif");
}

export async function approvePengirimanMandor(id: string) {
  return requestManage<Delivery>(`/api/mandor/pengiriman/${id}/approve`, {
    method: "POST",
  });
}

export async function rejectPengirimanMandor(id: string, reason: string) {
  return requestManage<Delivery>(`/api/mandor/pengiriman/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// Admin

export async function fetchPendingAdmin(): Promise<Delivery[]> {
  return requestManage<Delivery[]>("/api/admin/pengiriman/pending");
}

export async function approvePengirimanAdmin(id: string) {
  return requestManage<Delivery>(`/api/admin/pengiriman/${id}/approve`, {
    method: "POST",
  });
}

export async function partialRejectPengirimanAdmin(
  id: string,
  recognizedKg: number,
  reason: string,
) {
  return requestManage<Delivery>(`/api/admin/pengiriman/${id}/partial-reject`, {
    method: "POST",
    body: JSON.stringify({ recognizedKg, reason }),
  });
}

export async function rejectPengirimanAdmin(id: string, reason: string) {
  return requestManage<Delivery>(`/api/admin/pengiriman/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

