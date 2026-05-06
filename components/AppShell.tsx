import { TopNav } from "./TopNav";

export function AppShell(props: {
  section: string;
  userLabel: string;
  userInitials: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--palmery-bg)] text-slate-900">
      <TopNav
        section={props.section}
        userLabel={props.userLabel}
        userInitials={props.userInitials}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {props.children}
      </main>
    </div>
  );
}

