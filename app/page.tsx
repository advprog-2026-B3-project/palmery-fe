"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLoginUrl } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";

const PLANTATION_GALLERY = [
  { src: "/imgkebun1.jpg", alt: "Kebun sawit dari kejauhan" },
  { src: "/imgkebun2.jpg", alt: "Buah sawit segar" },
  { src: "/imgkebun3.jpg", alt: "Pemandangan kebun sawit" },
];

const PLANTATION_BANNER = { src: "/imgkebun4.jpg", alt: "Lanskap perkebunan sawit" };

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />

      <section className="px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-[#3D5A00] to-[#5A7A1A] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Selamat Datang di Palmery</h1>
              <p className="text-white/80 mb-6 max-w-md">
                Platform terpadu untuk mengelola perkebunan kelapa sawit Anda, dari pencatatan kebun, hasil panen, pengiriman, hingga pembayaran.
              </p>
              <Link
                href={isAuthenticated ? "/dashboard" : loginUrl}
                className="inline-flex rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-accent-light)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                {isAuthenticated ? "Buka Dashboard" : "Daftar Sekarang"}
              </Link>
            </div>
            <div className="w-full md:w-80 h-48 md:h-56 rounded-xl bg-white/10 flex items-center justify-center p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/palmery.svg" alt="Palmery" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Pengelolaan kebun masih manual?</h2>
          <p className="text-[var(--color-text-muted)] mb-6 max-w-2xl">
            Data tersebar di banyak tempat menyulitkan pemantauan hasil panen dan logistik pengiriman. Palmery menyatukan seluruh proses dalam satu sistem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANTATION_GALLERY.map((image) => (
              <div
                key={image.src}
                className="h-40 rounded-xl overflow-hidden border border-[var(--color-border)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Satu platform untuk seluruh siklus operasi</h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            Kebun, hasil panen, pengiriman, dan pembayaran—terintegrasi dalam satu sistem.
          </p>
          <div className="h-48 md:h-64 rounded-2xl overflow-hidden border border-[var(--color-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PLANTATION_BANNER.src}
              alt={PLANTATION_BANNER.alt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16" id="features">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Fitur Palmery</h2>
          <p className="text-[var(--color-text-muted)] mb-12 max-w-2xl mx-auto">
            Satu platform untuk seluruh siklus operasi kebun sawit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-left">
              <h3 className="font-semibold mb-2">Manajemen Kebun Sawit</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Pemetaan lahan dan pencatatan kondisi setiap blok kebun.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-left">
              <h3 className="font-semibold mb-2">Manajemen Hasil Panen Sawit</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Pencatatan harian, validasi mandor, dan jejak audit hasil panen.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-left">
              <h3 className="font-semibold mb-2">Manajemen Pengiriman Panen</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Koordinasi armada dari titik kumpul ke pabrik dengan status pengiriman.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12" id="payment">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
            <h3 className="font-semibold mb-2">Manajemen Pembayaran</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Payroll otomatis untuk Buruh, Mandor, dan Supir dengan jejak audit yang transparan.
            </p>
          </div>

          <div className="bg-[var(--color-accent)] rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-1">SawitBid Auctions</h3>
            <p className="text-2xl font-bold mb-2">Rp 2.450 <span className="text-sm font-normal">/kg</span></p>
            <p className="text-sm text-white/80 mb-4">
              Hubungkan kebun langsung dengan pembeli melalui platform lelang real-time.
            </p>
            <Link
              href="/sawitbid"
              className="inline-flex rounded-full bg-white text-[var(--color-primary)] px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Masuk ke Lelang
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Siap memodernisasi operasional perkebunan Anda?</h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            Bergabung dengan Palmery untuk mengelola kebun, panen, pengiriman, dan pembayaran dalam satu platform.
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : loginUrl}
            className="inline-flex rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-light)] transition-colors"
          >
            {isAuthenticated ? "Buka Dashboard" : "Daftar Sekarang"}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
