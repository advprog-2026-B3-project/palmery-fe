import { HomeLanding } from "@/components/home-landing";

type PageProps = {
  searchParams: Promise<{
    login?: string;
    from?: string;
    error?: string;
  }>;
};

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <section className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-3xl font-semibold">Palmery FE</h1>
        <p className="mt-2 text-zinc-300">Frontend for manage/payment integration checks.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/kebun"
            className="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Kelola Kebun Sawit
          </Link>
          <Link
            href="/debug"
            className="inline-flex rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Debug Page
          </Link>
        </div>
      </section>
    </main>
  );
}
