import { useMemo, useState } from "react";
import { getEnabledPillars } from "../../app/navigation/pillarsConfig";
import { AppPillarKey } from "../../types/appPillarNavigation";
import { MobileAppShell } from "./MobileAppShell";
import { MobilePillarCard } from "./MobilePillarCard";
import { MobilePillarItemList } from "./MobilePillarItemList";
import { MobileQuickActions } from "./MobileQuickActions";

export function MobilePillarHome() {
  const pillars = useMemo(() => getEnabledPillars(), []);
  const [activePillarKey, setActivePillarKey] =
    useState<AppPillarKey>("fazenda");

  const activePillar =
    pillars.find((pillar) => pillar.key === activePillarKey) ??
    pillars[0];

  return (
    <MobileAppShell
      title="Início"
      subtitle="Sistema Operacional Agronômico"
    >
      <section className="p-4">
        <div className="rounded-3xl border border-emerald-900/60 bg-emerald-950/30 p-4">
          <p className="text-sm text-emerald-400">
            Gestão Agro
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Cinco pilares para organizar a fazenda.
          </h2>

          <p className="mt-2 text-sm text-zinc-300">
            Navegue por Fazenda, Operações, Agronomia, Inteligência e Gestão.
          </p>
        </div>
      </section>

      <MobileQuickActions />

      <section className="px-4 py-3">
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">
          Pilares
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {pillars.map((pillar) => (
            <MobilePillarCard
              key={pillar.key}
              pillar={pillar}
              isActive={pillar.key === activePillar.key}
              onSelect={() => setActivePillarKey(pillar.key)}
            />
          ))}
        </div>
      </section>

      <MobilePillarItemList pillar={activePillar} />
    </MobileAppShell>
  );
}