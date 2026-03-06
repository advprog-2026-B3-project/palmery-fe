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


//types
export type HarvestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type HarvestPhoto = {
    url: string;
    filename: string;
    sizeBytes: number;
};

export type Harvest = {
    id: string;
    workerId: string;
    mandorId: string;
    plantationId: string;
    harvestDate: string;
    kgHarvested: number;
    notes: string;
    status: HarvestStatus;
    readyForDelivery: boolean;
    rejectionReason: string | null;
    validatedAt: string | null;
    createdAt: string;
    photos: HarvestPhoto[];
};

export type UploadPhotoResponse = {
    url: string;
    filename: string;
    sizeBytes: number;
};

// harvest buruh
// upload foto, dapat URL
export async function uploadHarvestPhoto(
    file: File,
    userId: string,
): Promise<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${MANAGE_BASE}/api/harvests/photos`, {
        method: "POST",
        headers: {
            "X-User-Id": userId,
            "X-User-Role": "BURUH",
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Gagal upload foto.");
    }

    return response.json();
}

// submit harvest (masukkan URL foto dari step 1 ke photos[])
export async function submitHarvest(
    payload: {
        plantationId: string;
        mandorId: string;
        harvestDate: string;
        kgHarvested: number;
        notes: string;
        photos: HarvestPhoto[];
    },
    userId: string,
): Promise<Harvest> {
    return requestManage<Harvest>("/api/harvests", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId,
            "X-User-Role": "BURUH",
        },
        body: JSON.stringify(payload),
    });
}

// Lihat history harvest sendiri
export async function fetchMyHarvests(
    userId: string,
    params?: {
        startDate?: string;
        endDate?: string;
        status?: HarvestStatus;
    },
): Promise<Harvest[]> {
    const qs = params
        ? "?" +
        new URLSearchParams(
            Object.fromEntries(
                Object.entries(params).filter(([, v]) => v !== undefined),
            ) as Record<string, string>,
        ).toString()
        : "";

    return requestManage<Harvest[]>(`/api/harvests/me${qs}`, {
        headers: {
            "X-User-Id": userId,
            "X-User-Role": "BURUH",
        },
    });
}

// =============================================
// Harvest - MANDOR
// =============================================

// Lihat semua harvest
export async function fetchAllHarvests(
    mandorId: string,
    params?: {
        date?: string;
        workerId?: string;
    },
): Promise<Harvest[]> {
    const qs = params
        ? "?" +
        new URLSearchParams(
            Object.fromEntries(
                Object.entries(params).filter(([, v]) => v !== undefined),
            ) as Record<string, string>,
        ).toString()
        : "";

    return requestManage<Harvest[]>(`/api/harvests${qs}`, {
        headers: {
            "X-User-Id": mandorId,
            "X-User-Role": "MANDOR",
        },
    });
}

// Approve atau Reject harvest
export async function validateHarvest(
    harvestId: string,
    mandorId: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
): Promise<Harvest> {
    return requestManage<Harvest>(`/api/harvests/${harvestId}/validate`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "X-User-Id": mandorId,
            "X-User-Role": "MANDOR",
        },
        body: JSON.stringify({ status, rejectionReason }),
    });
}

// Lihat detail harvest by ID
export async function fetchHarvestById(
    harvestId: string,
    userId: string,
    role: "BURUH" | "MANDOR" | "ADMIN",
): Promise<Harvest> {
    return requestManage<Harvest>(`/api/harvests/${harvestId}`, {
        headers: {
            "X-User-Id": userId,
            "X-User-Role": role,
        },
    });
}

// Lihat harvest per worker (MANDOR/ADMIN)
export async function fetchHarvestsByWorker(
    workerId: string,
    requesterId: string,
    role: "MANDOR" | "ADMIN",
): Promise<Harvest[]> {
    return requestManage<Harvest[]>(`/api/harvests/worker/${workerId}`, {
        headers: {
            "X-User-Id": requesterId,
            "X-User-Role": role,
        },
    });
}