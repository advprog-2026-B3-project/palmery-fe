"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  buildLoginUrl,
  buildRegisterUrl,
  clearSession,
  dashboardPathForRole,
  getSession,
  type AppRole,
  type AuthSession,
} from "@/lib/auth";

type HomeLandingProps = {
  loginHint?: string | null;
  fromPath?: string | null;
  error?: string | null;
};

function roleLabel(role: AppRole): string {
  switch (role) {
    case "ADMIN":
      return "Admin Utama";
    case "MANDOR":
      return "Mandor";
    case "SUPIR":
      return "Supir Truk";
    default:
      return role;
  }
}

export function HomeLanding({ loginHint, fromPath, error }: HomeLandingProps) {
  const [session, setSessionState] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSessionState(getSession());
  }, []);

  function handleLogout() {
    clearSession();
    setSessionState(null);
    window.location.href = "/";
  }

  const returnTarget = fromPath ?? undefined;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold">MySawit — Palmery</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Platform manajemen kebun sawit: pengiriman, panen, kebun, dan
                pembayaran terintegrasi.
              </p>
            </div>
            {session ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
                <p className="font-medium text-emerald-200">
                  {session.name || session.email || session.userId}
                </p>
                <p className="text-emerald-100/80">{roleLabel(session.role)}</p>
              </div>
            ) : null}
          </div>

          {loginHint === "required" ? (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
              Anda perlu login untuk mengakses halaman tersebut.
            </p>
          ) : null}
          {loginHint === "expired" ? (
            <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
              Sesi Anda telah berakhir. Silakan login kembali.
            </p>
          ) : null}
          {error === "forbidden" ? (
            <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
              Akun Anda tidak memiliki akses ke halaman yang diminta.
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {session ? (
              <>
                <Link
                  href={dashboardPathForRole(session.role)}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Buka Dashboard {roleLabel(session.role)}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href={buildLoginUrl(returnTarget)}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Login
                </a>
                <a
                  href={buildRegisterUrl(returnTarget)}
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                >
                  Daftar Akun
                </a>
              </>
            )}
          </div>

          {!session ? (
            <p className="mt-4 text-xs text-zinc-500">
              Login dan registrasi dilakukan di Palmery Auth, lalu Anda dialihkan
              kembali ke aplikasi ini dengan JWT dan peran yang sesuai.
            </p>
          ) : null}
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-sm">
            <h2 className="text-base font-semibold">Modul Pengiriman — Supir</h2>
            <p className="mt-2 text-zinc-300">
              Kelola status pengiriman aktif dan riwayat panen yang diangkut.
            </p>
            {session?.role === "SUPIR" ? (
              <Link
                href="/supir"
                className="mt-3 inline-flex text-xs font-medium text-emerald-300"
              >
                Buka dashboard supir
              </Link>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">Perlu akun Supir Truk</p>
            )}
          </article>

          <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-sm">
            <h2 className="text-base font-semibold">Modul Pengiriman — Mandor</h2>
            <p className="mt-2 text-zinc-300">
              Monitor truk, buat pengiriman, dan approve hasil di lapangan.
            </p>
            {session?.role === "MANDOR" ? (
              <Link
                href="/mandor"
                className="mt-3 inline-flex text-xs font-medium text-sky-300"
              >
                Buka dashboard mandor
              </Link>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">Perlu akun Mandor</p>
            )}
          </article>

          <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-sm">
            <h2 className="text-base font-semibold">Modul Pengiriman — Admin</h2>
            <p className="mt-2 text-zinc-300">
              Review pengiriman dari mandor dan proses di pabrik.
            </p>
            {session?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="mt-3 inline-flex text-xs font-medium text-amber-300"
              >
                Buka dashboard admin
              </Link>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">Perlu akun Admin</p>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
