import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold">Pengiriman Sawit</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Pilih peran untuk memantau dan mengelola pengiriman sawit end-to-end.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Notification, wallet, payroll, dan mock gateway tersedia untuk demo milestone Vincent.
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/supir"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Masuk sebagai Supir
            </Link>
            <Link
              href="/mandor"
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
            >
              Masuk sebagai Mandor
            </Link>
            <Link
              href="/admin"
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
            >
              Masuk sebagai Admin
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/wallet?userId=buruh-demo"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Buka Wallet
            </Link>
            <Link
              href="/admin/payroll"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Buka Payroll Desk
            </Link>
            <Link
              href="/admin/topup"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Buka Top-Up
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-sm">
            <h2 className="text-base font-semibold">Dashboard Supir</h2>
            <p className="mt-2 text-zinc-300">
              Lihat daftar pengiriman aktif dan update status secara berurutan dari{" "}
              <span className="font-mono">Memuat</span> hingga{" "}
              <span className="font-mono">Tiba di Tujuan</span>.
            </p>
            <Link
              href="/supir"
              className="mt-3 inline-flex text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Buka dashboard supir
            </Link>
          </article>

          <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-sm">
            <h2 className="text-base font-semibold">Dashboard Mandor</h2>
            <p className="mt-2 text-zinc-300">
              Monitor semua truk di kebun, buat pengiriman baru dari panen siap angkut, dan review hasil
              pengiriman supir.
            </p>
            <Link
              href="/mandor"
              className="mt-3 inline-flex text-xs font-medium text-sky-300 hover:text-sky-200"
            >
              Buka dashboard mandor
            </Link>
          </article>

          <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 text-sm">
            <h2 className="text-base font-semibold">Dashboard Admin</h2>
            <p className="mt-2 text-zinc-300">
              Tinjau pengiriman yang menunggu review admin dan lakukan approve, reject penuh, atau
              partial reject dengan kg diakui.
            </p>
            <Link
              href="/admin"
              className="mt-3 inline-flex text-xs font-medium text-amber-300 hover:text-amber-200"
            >
              Buka dashboard admin
            </Link>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm">
            <h2 className="text-base font-semibold">Wallet & Payroll Demo</h2>
            <p className="mt-2 text-zinc-300">
              User dapat melihat saldo SawitDollar, filter payroll, membuka detail kalkulasi, dan
              admin dapat approve atau reject payroll dari panel sederhana.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/wallet?userId=buruh-demo"
                className="inline-flex rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Wallet User
              </Link>
              <Link
                href="/admin/payroll"
                className="inline-flex rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Admin Payroll
              </Link>
            </div>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm">
            <h2 className="text-base font-semibold">Debug & Event Simulator</h2>
            <p className="mt-2 text-zinc-300">
              Halaman debug tetap tersedia untuk pengujian integrasi frontend, backend, database, dan
              publish event ke broker payment.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/debug"
                className="inline-flex rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Buka halaman debug
              </Link>
              <Link
                href="/admin/topup"
                className="inline-flex rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Mock Gateway
              </Link>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
