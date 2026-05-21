export type PengirimanStatus =
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

export type Pengiriman = {
  id: string;
  supir_id: string;
  mandor_id: string;
  kebun_id: string;
  total_kg: number;
  status: PengirimanStatus;
  panen_ids: string[];
  rejected_reason: string | null;
  recognized_kg: number | null;
  created_at: string;
  updated_at: string;
};

export type SupirDriver = {
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

import { getSession } from "@/lib/auth";

const MANAGE_BASE =
  process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL ?? "http://localhost:8081";

async function requestManage<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const session = getSession();
  const response = await fetch(`${MANAGE_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
      ...(session?.userId ? { "X-User-Id": session.userId } : {}),
      ...(init?.headers ?? {}),
    } as HeadersInit,
    ...init,
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/?login=required";
    }
    throw new Error("Sesi login telah berakhir. Silakan login kembali.");
  }

  if (!response.ok) {
    let message = "Terjadi kesalahan. Silakan coba lagi.";
    if (data && typeof data === "object") {
      const payload = data as { message?: unknown; error?: unknown };
      const m =
        typeof payload.message === "string"
          ? payload.message
          : typeof payload.error === "string"
            ? payload.error
            : null;
      if (m && m.trim().length > 0) {
        message = m;
      }
    }
    throw new Error(message);
  }

  return data as T;
}

// Supir

export async function fetchPengirimanAktifSupir(): Promise<Pengiriman[]> {
  return requestManage<Pengiriman[]>("/api/supir/pengiriman/aktif");
}

export async function fetchRiwayatSupir(params: {
  from: string;
  to: string;
}): Promise<Pengiriman[]> {
  const search = new URLSearchParams(params).toString();
  return requestManage<Pengiriman[]>(`/api/supir/pengiriman/riwayat?${search}`);
}

export async function updateStatusSupir(
  pengirimanId: string,
  status: PengirimanStatus,
) {
  return requestManage<Pengiriman>(
    `/api/supir/pengiriman/${pengirimanId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

// Mandor

export async function fetchDrivers(search: string): Promise<SupirDriver[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return requestManage<SupirDriver[]>(`/api/mandor/drivers${qs}`);
}

export async function fetchPanenSiapAngkut(): Promise<HarvestSummary[]> {
  return requestManage<HarvestSummary[]>("/api/mandor/panen/siap-angkut");
}

export async function createPengirimanBaru(payload: {
  supirId: string;
  panenIds: string[];
}) {
  return requestManage<Pengiriman>("/api/mandor/pengiriman", {
    method: "POST",
    body: JSON.stringify({
      supirId: payload.supirId,
      panenIds: payload.panenIds,
    }),
  });
}

export async function fetchPengirimanAktifMandor(): Promise<Pengiriman[]> {
  return requestManage<Pengiriman[]>("/api/mandor/pengiriman/aktif");
}

export async function fetchPengirimanBySupirForMandor(
  supirId: string,
  params?: { from?: string; to?: string },
): Promise<Pengiriman[]> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const qs = search.toString();
  return requestManage<Pengiriman[]>(
    `/api/mandor/supir/${supirId}/pengiriman${qs ? `?${qs}` : ""}`,
  );
}

export async function approvePengirimanMandor(id: string) {
  return requestManage<Pengiriman>(`/api/mandor/pengiriman/${id}/approve`, {
    method: "POST",
  });
}

export async function rejectPengirimanMandor(id: string, reason: string) {
  return requestManage<Pengiriman>(`/api/mandor/pengiriman/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// Admin

export async function fetchPendingAdmin(params?: {
  mandor?: string;
  date?: string;
}): Promise<Pengiriman[]> {
  const search = new URLSearchParams();
  if (params?.mandor) search.set("mandor", params.mandor);
  if (params?.date) search.set("date", params.date);
  const qs = search.toString();
  return requestManage<Pengiriman[]>(
    `/api/admin/pengiriman/pending${qs ? `?${qs}` : ""}`,
  );
}

export async function fetchPengirimanAdminDetail(id: string): Promise<Pengiriman> {
  return requestManage<Pengiriman>(`/api/admin/pengiriman/${id}`);
}

export async function approvePengirimanAdmin(id: string) {
  return requestManage<Pengiriman>(`/api/admin/pengiriman/${id}/approve`, {
    method: "POST",
  });
}

export async function partialRejectPengirimanAdmin(
  id: string,
  recognizedKg: number,
  reason: string,
) {
  return requestManage<Pengiriman>(
    `/api/admin/pengiriman/${id}/partial-reject`,
    {
      method: "POST",
      body: JSON.stringify({ recognizedKg, reason }),
    },
  );
}

export async function rejectPengirimanAdmin(id: string, reason: string) {
  return requestManage<Pengiriman>(`/api/admin/pengiriman/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
