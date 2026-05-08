"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/notification-bell";

const STORAGE_KEY = "palmery-current-user";

export function AppNavbar() {
  const [currentUser, setCurrentUser] = useState("buruh-demo");

  useEffect(() => {
    const savedUser = window.localStorage.getItem(STORAGE_KEY);
    if (savedUser && savedUser.trim()) {
      setCurrentUser(savedUser.trim());
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, currentUser);
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(118,92,45,0.3)] bg-[rgba(24,18,11,0.88)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 text-stone-100 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">Palmery</p>
          <p className="text-sm text-stone-300">Payment, wallet, and notification desk</p>
        </div>

        <nav className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-full border border-stone-700/80 px-3 py-2 text-stone-200 transition hover:border-amber-400/70 hover:text-white"
          >
            Home
          </Link>
          <Link
            href={`/wallet?userId=${encodeURIComponent(currentUser)}`}
            className="rounded-full border border-stone-700/80 px-3 py-2 text-stone-200 transition hover:border-amber-400/70 hover:text-white"
          >
            Wallet
          </Link>
          <Link
            href="/admin/payroll"
            className="rounded-full border border-stone-700/80 px-3 py-2 text-stone-200 transition hover:border-amber-400/70 hover:text-white"
          >
            Payroll
          </Link>
          <Link
            href="/admin/topup"
            className="rounded-full border border-stone-700/80 px-3 py-2 text-stone-200 transition hover:border-amber-400/70 hover:text-white"
          >
            Top-Up
          </Link>
          <Link
            href="/debug"
            className="rounded-full border border-stone-700/80 px-3 py-2 text-stone-200 transition hover:border-amber-400/70 hover:text-white"
          >
            Debug
          </Link>
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-950/60 px-3 py-2">
          <span className="text-xs uppercase tracking-[0.2em] text-stone-400">Viewer</span>
          <input
            value={currentUser}
            onChange={(event) => setCurrentUser(event.target.value)}
            className="w-28 bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
            placeholder="user id"
          />
          <NotificationBell userId={currentUser} />
        </div>
      </div>
    </header>
  );
}
