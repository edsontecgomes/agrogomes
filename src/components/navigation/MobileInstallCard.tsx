import { usePWAInstall } from "../../hooks/usePWAInstall";

export function MobileInstallCard() {
  const { canInstall, installApp } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <section className="px-4 pb-3">
      <button
        type="button"
        onClick={installApp}
        className="w-full rounded-2xl border border-emerald-800 bg-emerald-950/40 p-4 text-left active:scale-[0.98]"
      >
        <p className="text-sm font-semibold text-emerald-400">
          Instalar no celular
        </p>

        <h2 className="mt-1 text-lg font-bold text-white">
          Usar Gestão Agro como aplicativo
        </h2>

        <p className="mt-2 text-sm text-zinc-300">
          Instale o app na tela inicial para acessar mais rápido no campo.
        </p>
      </button>
    </section>
  );
}