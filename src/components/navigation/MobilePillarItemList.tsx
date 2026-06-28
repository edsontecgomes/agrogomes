import { Link } from "react-router-dom";
import { AppPillarConfig } from "../../types/appPillarNavigation";

interface MobilePillarItemListProps {
  pillar: AppPillarConfig;
}

export function MobilePillarItemList({
  pillar,
}: MobilePillarItemListProps) {
  return (
    <section className="px-4 pb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{pillar.icon}</span>

        <div>
          <h2 className="text-base font-bold text-white">
            {pillar.label}
          </h2>

          <p className="text-xs text-zinc-400">
            {pillar.description}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {pillar.items.map((item) => (
          <Link
            key={`${pillar.key}-${item.label}`}
            to={item.path}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 active:scale-[0.98]"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{item.icon}</div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  {item.label}
                </h3>

                <p className="mt-1 text-xs text-zinc-400">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}