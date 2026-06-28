import { NavLink } from "react-router-dom";

const items = [
  { label: "Início", path: "/", icon: "🏠" },
  { label: "Chuva", path: "/chuva", icon: "🌧️" },
  { label: "Operar", path: "/servicos", icon: "🚜" },
  { label: "Talhões", path: "/talhoes", icon: "🗺️" },
  { label: "IA", path: "/inteligencia", icon: "🧠" },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex flex-col items-center justify-center py-2 text-xs",
                isActive ? "text-emerald-400" : "text-zinc-400",
              ].join(" ")
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}