import { HectaLayerConfig, HectaVisualLayer } from "../../../types/hectaVisual";

interface HectaLayerBarProps {
  layers: HectaLayerConfig[];
  activeLayers: HectaVisualLayer[];
  onToggleLayer: (layer: HectaVisualLayer) => void;
}

export function HectaLayerBar({
  layers,
  activeLayers,
  onToggleLayer,
}: HectaLayerBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3">
      {layers.map((layer) => {
        const isActive = activeLayers.includes(layer.key);

        return (
          <button
            key={layer.key}
            type="button"
            onClick={() => onToggleLayer(layer.key)}
            className={[
              "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold",
              isActive
                ? "border-emerald-500 bg-emerald-600 text-white"
                : "border-zinc-700 bg-black/70 text-zinc-300",
            ].join(" ")}
          >
            <span className="mr-1">{layer.icon}</span>
            {layer.label}
          </button>
        );
      })}
    </div>
  );
}