"use client";

import Link from "next/link";
import { useState } from "react";
import {
  createDatabaseCheck,
  fetchDatabaseChecks,
  fetchIntegrationStatus,
  type ServiceName,
} from "@/lib/debug-api";

type ConnectionState = {
  status: string;
  latencyMs?: number;
};

type ServiceState = {
  integrationPayload: Record<string, unknown> | null;
  latestChecks: Record<string, unknown>[];
  lastCreatedCheck: Record<string, unknown> | null;
  frontendToBackend: ConnectionState;
  backendToDatabase: ConnectionState;
  message: string | null;
  error: string | null;
};

const SERVICES: ServiceName[] = ["manage", "payment"];

const DEFAULT_STATE: ServiceState = {
  integrationPayload: null,
  latestChecks: [],
  lastCreatedCheck: null,
  frontendToBackend: { status: "unknown" },
  backendToDatabase: { status: "unknown" },
  message: null,
  error: null,
};

function serviceLabel(service: ServiceName): string {
  return service === "manage" ? "Palmery Manage" : "Palmery Payment";
}

function extractDatabaseConnection(payload: Record<string, unknown>): ConnectionState {
  const database = payload.database as Record<string, unknown> | undefined;
  return {
    status: typeof database?.status === "string" ? database.status : "unknown",
    latencyMs: typeof database?.latency_ms === "number" ? database.latency_ms : undefined,
  };
}

export default function DebugPage() {
  const [states, setStates] = useState<Record<ServiceName, ServiceState>>({
    manage: { ...DEFAULT_STATE },
    payment: { ...DEFAULT_STATE },
  });
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);

  function updateState(service: ServiceName, patch: Partial<ServiceState>) {
    setStates((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        ...patch,
      },
    }));
  }

  async function loadIntegration(service: ServiceName) {
    updateState(service, { message: "Checking integration status...", error: null });

    const startedAt = performance.now();
    try {
      const integrationPayload = await fetchIntegrationStatus(service);
      const frontendLatency = Math.round(performance.now() - startedAt);

      updateState(service, {
        integrationPayload,
        frontendToBackend: { status: "connected", latencyMs: frontendLatency },
        backendToDatabase: extractDatabaseConnection(integrationPayload),
        message: "Integration status loaded.",
      });
    } catch (error) {
      updateState(service, {
        integrationPayload: null,
        frontendToBackend: { status: "disconnected" },
        backendToDatabase: { status: "unknown" },
        message: null,
        error: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }

  async function createCheck(service: ServiceName) {
    updateState(service, { message: "Creating DB test object...", error: null });

    try {
      const created = await createDatabaseCheck(service);
      updateState(service, {
        lastCreatedCheck: created,
        message: "DB test object created. Run list checks to verify read path.",
      });
    } catch (error) {
      updateState(service, {
        message: null,
        error: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }

  async function loadChecks(service: ServiceName) {
    updateState(service, { message: "Loading latest DB checks...", error: null });

    try {
      const checks = await fetchDatabaseChecks(service);
      updateState(service, {
        latestChecks: checks,
        message: "Latest DB checks loaded.",
      });
    } catch (error) {
      updateState(service, {
        message: null,
        error: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }

  async function runHealthcheckForAll() {
    setGlobalMessage("Running healthcheck for manage and payment...");
    await Promise.all(SERVICES.map((service) => loadIntegration(service)));
    setGlobalMessage("Healthcheck finished.");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-2xl font-semibold">Palmery Integration Debug</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Validate frontend to backend and backend to database integration for manage and payment.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runHealthcheckForAll}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Run Healthcheck (All)
            </button>
            <Link
              href="/"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Back to Home
            </Link>
          </div>
          {globalMessage ? <p className="mt-3 text-sm text-zinc-300">{globalMessage}</p> : null}
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          {SERVICES.map((service) => {
            const state = states[service];

            return (
              <article key={service} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <h2 className="text-lg font-semibold">{serviceLabel(service)}</h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadIntegration(service)}
                    className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
                  >
                    Healthcheck
                  </button>
                  <button
                    type="button"
                    onClick={() => createCheck(service)}
                    className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500"
                  >
                    Create DB Test Object
                  </button>
                  <button
                    type="button"
                    onClick={() => loadChecks(service)}
                    className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
                  >
                    Load DB Checks
                  </button>
                </div>

                {state.message ? <p className="mt-3 text-sm text-zinc-300">{state.message}</p> : null}
                {state.error ? <p className="mt-3 text-sm text-rose-300">{state.error}</p> : null}

                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <h3 className="mb-1 font-medium text-zinc-200">Frontend to Backend</h3>
                    <pre className="overflow-x-auto rounded bg-zinc-950 p-3">
                      {JSON.stringify(state.frontendToBackend, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium text-zinc-200">Backend to Database</h3>
                    <pre className="overflow-x-auto rounded bg-zinc-950 p-3">
                      {JSON.stringify(state.backendToDatabase, null, 2)}
                    </pre>
                  </div>

                  {state.lastCreatedCheck ? (
                    <div>
                      <h3 className="mb-1 font-medium text-zinc-200">Latest Created DB Test Object</h3>
                      <pre className="overflow-x-auto rounded bg-zinc-950 p-3">
                        {JSON.stringify(state.lastCreatedCheck, null, 2)}
                      </pre>
                    </div>
                  ) : null}

                  {state.integrationPayload ? (
                    <div>
                      <h3 className="mb-1 font-medium text-zinc-200">Raw Integration Payload</h3>
                      <pre className="overflow-x-auto rounded bg-zinc-950 p-3">
                        {JSON.stringify(state.integrationPayload, null, 2)}
                      </pre>
                    </div>
                  ) : null}

                  {state.latestChecks.length > 0 ? (
                    <div>
                      <h3 className="mb-1 font-medium text-zinc-200">Latest DB Checks</h3>
                      <pre className="overflow-x-auto rounded bg-zinc-950 p-3">
                        {JSON.stringify(state.latestChecks, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
