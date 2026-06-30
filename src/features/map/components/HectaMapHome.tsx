import { useMemo, useState } from "react";
import { HectaLayerConfig, HectaVisualLayer } from "../../../types/hectaVisual";
import { HectaLayerBar } from "./HectaLayerBar";
import { HectaMapPanel } from "./HectaMapPanel";

interface HectaMapHomeProps {
  farmId?: string;
}

const LAYERS: HectaLayerConfig[] = [
  { key: "talhoes", label: "Talhões", icon: "🗺️", enabled: true },
  { key: "grid_hectares", label: "Grid 1 ha", icon: "▦", enabled: true },
  { key: "chuva", label: "Chuva", icon: "🌧️", enabled: true },
  { key: "solo", label: "Solo", icon: "🧱", enabled: true },
  { key: "produtividade", label: "Produtividade", icon: "📈", enabled: true },
  { key: "operacoes", label: "Operações", icon: "🚜", enabled: true },
  { key: "inteligencia", label: "IA", icon: "🧠", enabled: true },
];

export default function HectaMapHome({
  farmId = "fazenda-ativa",
}: HectaMapHomeProps) {
  const enabledLayers = useMemo(
    () => LAYERS.filter((layer) => layer.enabled),
    []
  );

  const [activeLayers, setActiveLayers] = useState<HectaVisualLayer[]>([
    "talhoes",
    "grid_hectares",
    "inteligencia",
  ]);

  function toggleLayer(layer: HectaVisualLayer) {
    setActiveLayers((current) =>
      current.includes(layer)
        ? current.filter((item) => item !== layer)
        : [...current, layer]
    );
  }

  const showGrid = activeLayers.includes("grid_hectares");
  const showTalhoes = activeLayers.includes("talhoes");
  const showIa = activeLayers.includes("inteligencia");

  return (
    <main className="relative h-[calc(100vh-0px)] min-h-[720px] overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#14532d,_#052e16_42%,_#020617)]" />

      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(30deg,rgba(255,255,255,.05)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,.05)_87.5%,rgba(255,255,255,.05)),linear-gradient(150deg,rgba(255,255,255,.05)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,.05)_87.5%,rgba(255,255,255,.05))] [background-size:80px_140px]" />

      <header className="absolute left-0 right-0 top-0 z-30 border-b border-zinc-800 bg-black/70 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Hecta
            </p>

            <h1 className="text-lg font-bold">
              Mapa vivo da fazenda
            </h1>
          </div>

          <button
            type="button"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            IA
          </button>
        </div>

        <HectaLayerBar
          layers={enabledLayers}
          activeLayers={activeLayers}
          onToggleLayer={toggleLayer}
        />
      </header>

      <HectaMapPanel farmId={farmId} />

      <svg className="absolute inset-0 h-full w-full">
        {showTalhoes && (
          <polygon
            points="260,250 720,190 980,360 860,650 420,720 220,480"
            fill="rgba(34,197,94,0.22)"
            stroke="#86efac"
            strokeWidth="4"
          />
        )}

        {showGrid &&
          Array.from({ length: 9 }).map((_, index) => (
            <line
              key={`v-${index}`}
              x1={280 + index * 75}
              y1="245"
              x2={280 + index * 75}
              y2="710"
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="1"
            />
          ))}

        {showGrid &&
          Array.from({ length: 7 }).map((_, index) => (
            <line
              key={`h-${index}`}
              x1="230"
              y1={280 + index * 65}
              x2="960"
              y2={280 + index * 65}
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="1"
            />
          ))}

        {showIa && (
          <circle
            cx="610"
            cy="455"
            r="70"
            fill="rgba(168,85,247,0.18)"
            stroke="#c084fc"
            strokeWidth="3"
          />
        )}
      </svg>

      <section className="absolute bottom-6 left-4 right-4 z-30 rounded-3xl border border-zinc-800 bg-black/80 p-4 backdrop-blur">
        <p className="text-xs text-zinc-400">
          Princípio Hecta
        </p>

        <h2 className="mt-1 text-lg font-bold">
          Cada hectare se torna mais inteligente a cada dia.
        </h2>

        <p className="mt-2 text-sm text-zinc-300">
          As camadas ativas mostram talhões, grid de 1 ha e leitura inicial da inteligência.
        </p>
      </section>
    </main>
  );
}