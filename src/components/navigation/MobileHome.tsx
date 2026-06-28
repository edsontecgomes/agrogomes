import { MobileAppShell } from "./MobileAppShell";
import { MobileModuleGrid } from "./MobileModuleGrid";
import { MobileQuickActions } from "./MobileQuickActions";

export function MobileHome() {
  return (
    <MobileAppShell
      title="Início"
      subtitle="Sistema Operacional Agronômico"
    >
      <section className="p-4">
        <div className="rounded-3xl border border-emerald-900/60 bg-emerald-950/30 p-4">
          <p className="text-sm text-emerald-400">
            Memória Agronômica
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Dados de campo viram inteligência permanente.
          </h2>

          <p className="mt-2 text-sm text-zinc-300">
            Registre chuva, operações, manejo e resultados para alimentar o motor de inteligência por hectare.
          </p>
        </div>
      </section>

      <MobileQuickActions />

      <section className="px-4 pt-2">
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">
          Módulos
        </h2>
      </section>

      <MobileModuleGrid />
    </MobileAppShell>
  );
}