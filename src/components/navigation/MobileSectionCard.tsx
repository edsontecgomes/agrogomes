import { Link } from "react-router-dom";

interface MobileSectionCardProps {
  title: string;
  description: string;
  icon: string;
  to: string;
}

export function MobileSectionCard({
  title,
  description,
  icon,
  to,
}: MobileSectionCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-4 active:scale-[0.98]"
    >
      <div className="mb-3 text-3xl">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        {description}
      </p>
    </Link>
  );
}