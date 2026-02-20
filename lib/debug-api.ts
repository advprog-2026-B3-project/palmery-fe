export type ServiceName = "manage" | "payment";

const API_BASES: Record<ServiceName, string> = {
  manage: process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL ?? "http://localhost:8081",
  payment: process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL ?? "http://localhost:8082",
};

async function parseJson(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

async function requestDebug(
  service: ServiceName,
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await fetch(`${API_BASES[service]}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(`Request failed for ${service}: ${response.status}`);
  }
  return data;
}

export async function fetchIntegrationStatus(
  service: ServiceName,
): Promise<Record<string, unknown>> {
  const data = await requestDebug(service, "/api/debug/integration");
  return data as Record<string, unknown>;
}

export async function createDatabaseCheck(
  service: ServiceName,
  source = "frontend-debug",
): Promise<Record<string, unknown>> {
  const data = await requestDebug(service, "/api/debug/checks", {
    method: "POST",
    body: JSON.stringify({ source }),
  });
  return data as Record<string, unknown>;
}

export async function fetchDatabaseChecks(
  service: ServiceName,
): Promise<Record<string, unknown>[]> {
  const data = await requestDebug(service, "/api/debug/checks");
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
}
