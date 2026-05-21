"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLoginUrl } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />

      {/* Hero Section */}
      <section className="px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-[#3D5A00] to-[#5A7A1A] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Palmery</h1>
              <p className="text-white/80 mb-6 max-w-md">
                Welcome to the all-in-one web to manage your Palm Oil Plantation. From field operations to executive oversight, we simplify growth.
              </p>
              <Link
                href={isAuthenticated ? "/dashboard" : loginUrl}
                className="inline-flex rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-accent-light)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                {isAuthenticated ? "Go to Dashboard" : "Join Today"}
              </Link>
            </div>
            <div className="w-full md:w-80 h-48 md:h-56 rounded-xl bg-[url('/palm-hero.jpg')] bg-cover bg-center bg-[#2C3E1A]/50" />
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Does your plantation look like this?</h2>
          <p className="text-[var(--color-text-muted)] mb-6 max-w-2xl">
            Hard to Manage? Hard to Track Everything? Scattered data leads to lost profits and inefficient harvests.
          </p>
          <div className="border-l-4 border-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-r-lg p-4 mb-8 max-w-2xl">
            <p className="text-sm italic text-[var(--color-primary)]">
              &ldquo;We used to lose 35% of our harvest due to logistics delays before switching to Palmery&rdquo;
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 rounded-xl bg-[var(--color-bg-dark)]/20 border border-[var(--color-border)]" />
            <div className="h-40 rounded-xl bg-[var(--color-bg-dark)]/20 border border-[var(--color-border)]" />
            <div className="h-40 rounded-xl bg-[var(--color-bg-dark)]/20 border border-[var(--color-border)]" />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">What if there was a tool to help manage it all?</h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            From Kebun, to Hasil Panen, to Pengiriman, to Pembayaran. One platform for the entire lifecycle.
          </p>
          <div className="h-48 md:h-64 rounded-2xl bg-[var(--color-bg-dark)]/30 border border-[var(--color-border)]" />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Introducing...</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">PALMERY</h2>
          <p className="text-[var(--color-text-muted)] mb-12">Our Features</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Manajemen Kebun Sawit</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Complete mapping and health tracking of every land parcel in your enterprise.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Manajemen Hasil Panen Sawit</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Real-time inventory of bunches, quality grading, and yield forecasting.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h6"/><circle cx="7" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Manajemen Pengiriman Panen</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Fleet coordination from the collection point to the mill with live GPS tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment & Auction Row */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Manajemen Pembayaran</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Automated payroll for field workers and transparent, vendor settlements.
            </p>
          </div>

          <div className="bg-[var(--color-accent)] rounded-xl p-6 text-white">
            <p className="text-xs uppercase tracking-wider mb-1 text-white/70">Connecting...</p>
            <h3 className="font-bold text-lg mb-1">SawitBid Auctions</h3>
            <p className="text-2xl font-bold mb-2">Rp 2.450 <span className="text-sm font-normal">/kg</span></p>
            <p className="text-sm text-white/80 mb-4">
              Connect directly with buyers in our real-time auction platform for the best possible market rates.
            </p>
            <Link
              href="/sawitbid"
              className="inline-flex rounded-full bg-white text-[var(--color-primary)] px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Enter Auction
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to modernize your operations?</h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            Join 500+ plantation owners already scaling with Palmery.
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : loginUrl}
            className="inline-flex rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-light)] transition-colors"
          >
            {isAuthenticated ? "Go to Dashboard" : "Join Today"}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
