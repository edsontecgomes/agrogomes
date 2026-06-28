import { Link } from "react-router-dom";

const actions = [
  {
    label: "Registrar chuva",
    path: "/chuva",
    icon: "🌧️",
  },
  {
    label: "Operar OS",
    path: "/servicos",
    icon: "🚜",
  },
  {
    label: "Ver talhões",
    path: "/talhoes",
    icon: "🗺️",
  },
];

export function MobileQuickActions() {
  return (
    <section className="px-4 py-3">
      <h2 className="mb-3 text-sm font-semibold text-zinc-300">
        Ações rápidas
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-center active:scale-[0.98]"
          >
            <div className="text-2xl">
              {action.icon}
            </div>

            <p className="mt-2 text-xs text-zinc-300">
              {action.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}