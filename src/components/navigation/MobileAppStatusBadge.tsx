import { usePWAInstall } from "../../hooks/usePWAInstall";

export function MobileAppStatusBadge() {
  const { isInstalled } = usePWAInstall();

  if (!isInstalled) return null;

  return (
    <div className="rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-300">
      App instalado
    </div>
  );
}