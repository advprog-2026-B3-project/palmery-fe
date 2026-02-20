import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <section className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-3xl font-semibold">Palmery FE</h1>
        <p className="mt-2 text-zinc-300">Frontend for manage/payment integration checks.</p>
        <div className="mt-6">
          <Link
            href="/debug"
            className="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Open Debug Page
          </Link>
        </div>
      </section>
    </main>
  );
}
