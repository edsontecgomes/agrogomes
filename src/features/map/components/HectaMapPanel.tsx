interface HectaMapPanelProps {
  farmId: string;
}

export function HectaMapPanel({ farmId }: HectaMapPanelProps) {
  return (
    <section className="absolute left-4 top-24 z-20 w-64 rounded-3xl border border-zinc-800 bg-black/75 p-4 text-white backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
        Fazenda ativa
      </p>

      <h2 className="mt-1 text-lg font-bold">
        Visão da propriedade
      </h2>

      <p className="mt-2 text-xs text-zinc-300">
        Mapa satélite, talhões, hectares inteligentes e camadas de análise.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-2xl bg-zinc-900 p-3">
          <p className="text-zinc-400">Farm ID</p>
          <p className="mt-1 truncate font-semibold text-white">{farmId}</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-3">
          <p className="text-zinc-400">Grid</p>
          <p className="mt-1 font-semibold text-emerald-400">1 ha</p>
        </div>
      </div>
    </section>
  );
}