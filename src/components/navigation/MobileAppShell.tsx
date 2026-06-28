import { ReactNode } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

interface MobileAppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function MobileAppShell({
  title,
  subtitle,
  children,
}: MobileAppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 text-white">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
          Gestão Agro
        </p>

        <h1 className="text-lg font-bold">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-xs text-zinc-400">
            {subtitle}
          </p>
        )}
      </header>

      <main>
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}