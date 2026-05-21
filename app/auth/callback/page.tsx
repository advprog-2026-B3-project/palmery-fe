"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  dashboardPathForRole,
  setSession,
  normalizeRole,
  decodeJwtPayload,
} from "@/lib/auth";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/?error=missing_token");
      return;
    }

    const payload = decodeJwtPayload(token);
    const role = normalizeRole(
      typeof payload?.role === "string" ? payload.role : null,
    );

    if (!role) {
      router.replace("/?error=invalid_role");
      return;
    }

    setSession(token);
    const next = searchParams.get("next");
    if (next && next.startsWith("/")) {
      router.replace(next);
      return;
    }
    router.replace(dashboardPathForRole(role));
  }, [router, searchParams]);

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 text-zinc-100">
      <p className="text-sm">Memproses login...</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-zinc-950 text-zinc-100">
          <p className="text-sm">Memproses login...</p>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
