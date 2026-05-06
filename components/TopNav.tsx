import Image from "next/image";
import Link from "next/link";

export function TopNav(props: {
  section: string;
  userLabel: string;
  userInitials: string;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-[var(--palmery-green)]">
            <span className="text-sm font-semibold text-white">P</span>
            <Image
              src="/logo.png"
              alt="Palmery"
              fill
              className="object-contain p-1"
              sizes="36px"
              priority
            />
          </span>
          <span className="text-lg font-semibold text-slate-700">Palmery</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 sm:flex">
            <span className="text-[var(--palmery-green)]">{props.section}</span>
          </nav>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-400 text-xs font-semibold text-white">
              {props.userInitials}
            </span>
            <span className="hidden sm:inline">{props.userLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
