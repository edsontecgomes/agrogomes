import { AppPillarConfig } from "../../types/appPillarNavigation";

interface MobilePillarCardProps {
  pillar: AppPillarConfig;
  isActive: boolean;
  onSelect: () => void;
}

export function MobilePillarCard({
  pillar,
  isActive,
  onSelect,
}: MobilePillarCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "min-w-[132px] rounded-2xl border p-3 text-left transition active:scale-[0.98]",
        pillar.colorClass,
        isActive ? "ring-2 ring-emerald-400" : "opacity-85",
      ].join(" ")}
    >
      <div className="text-2xl">{pillar.icon}</div>

      <h3 className="mt-2 text-sm font-semibold text-white">
        {pillar.label}
      </h3>

      <p className="mt-1 line-clamp-2 text-xs text-zinc-300">
        {pillar.description}
      </p>
    </button>
  );
}