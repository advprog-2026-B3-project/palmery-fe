import { getSession } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL ?? "http://localhost:8081";

// --- Types ---

export interface PlantationSummary {
  id: string;
  name: string;
  code: string;
  areaHa: number;
  isActive: boolean;
}

export interface PlantationDetail {
  id: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedMandorIds: string[];
  assignedSupirIds: string[];
}

export interface PlantationRequest {
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
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  details?: Record<string, string>;
}

// --- Helper ---

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getSession();

  const res = await fetch(`${API_BASE}${path}`, {
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

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/?login=required";
    }
    throw { timestamp: "", status: 401, error: "Sesi login telah berakhir. Silakan login kembali." } as ApiError;
  }

  if (!res.ok) {
    let body: ApiError;
    try {
      body = await res.json();
    } catch {
      body = { timestamp: "", status: res.status, error: "Terjadi kesalahan. Silakan coba lagi." };
    }
    throw body;
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// --- Plantation CRUD ---

export async function getPlantations(
  name?: string,
  code?: string
): Promise<PlantationSummary[]> {
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (code) params.set("code", code);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<PlantationSummary[]>(`/kebun${query}`);
}

export async function getPlantationById(
  id: string
): Promise<PlantationDetail> {
  return request<PlantationDetail>(`/kebun/${id}`);
}

export async function createPlantation(
  data: PlantationRequest
): Promise<PlantationDetail> {
  return request<PlantationDetail>("/kebun", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePlantation(
  id: string,
  data: PlantationRequest
): Promise<PlantationDetail> {
  return request<PlantationDetail>(`/kebun/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePlantation(id: string): Promise<void> {
  return request<void>(`/kebun/${id}`, { method: "DELETE" });
}

// --- Assignment ---

export async function assignMandor(
  plantationId: string,
  personnelId: string
): Promise<void> {
  return request<void>(`/kebun/${plantationId}/mandor`, {
    method: "POST",
    body: JSON.stringify({ personnelId }),
  });
}

export async function unassignMandor(
  plantationId: string,
  personnelId: string
): Promise<void> {
  return request<void>(`/kebun/${plantationId}/mandor`, {
    method: "DELETE",
    body: JSON.stringify({ personnelId }),
  });
}

export async function assignSupir(
  plantationId: string,
  personnelId: string
): Promise<void> {
  return request<void>(`/kebun/${plantationId}/supir`, {
    method: "POST",
    body: JSON.stringify({ personnelId }),
  });
}

export async function unassignSupir(
  plantationId: string,
  personnelId: string
): Promise<void> {
  return request<void>(`/kebun/${plantationId}/supir`, {
    method: "DELETE",
    body: JSON.stringify({ personnelId }),
  });
}
