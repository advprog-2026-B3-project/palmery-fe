"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setError("No token received from auth service.");
      return;
    }

    // Store the token
    try {
      localStorage.setItem("auth_access_token", token);
    } catch {
      setError("Failed to store authentication token.");
      return;
    }

    // Redirect to dashboard
    router.replace("/dashboard");
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-6">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 max-w-sm text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <a
            href="/"
            className="inline-flex rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-light)] transition-colors"
          >
            Kembali ke Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <p className="text-[var(--color-text-muted)]">Authenticating...</p>
    </div>
  );
}
