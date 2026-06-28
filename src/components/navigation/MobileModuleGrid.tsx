import { Link } from "react-router-dom";
import { getMobileModules } from "../../app/navigation/modulesConfig";

export function MobileModuleGrid() {
  const modules = getMobileModules();

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {modules.map((module) => (
        <Link
          key={module.key}
          to={module.path}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm active:scale-[0.98]"
        >
          <div className="mb-2 text-3xl">{module.icon}</div>

          <h3 className="text-base font-semibold text-white">
            {module.label}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
            {module.description}
          </p>
        </Link>
      ))}
    </div>
  );
}