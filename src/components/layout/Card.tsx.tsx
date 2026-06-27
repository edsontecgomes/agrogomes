import React from "react";

type CardProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  compact?: boolean;
};

export function Card({
  children,
  title,
  subtitle,
  icon,
  actions,
  className = "",
  onClick,
  compact = false,
}: CardProps) {
  const clickableClass = onClick
    ? "cursor-pointer hover:shadow-md hover:border-emerald-200 active:scale-[0.99]"
    : "";

  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        border
        border-slate-200
        rounded-3xl
        shadow-sm
        transition-all
        ${compact ? "p-4" : "p-5"}
        ${clickableClass}
        ${className}
      `}
    >
      {(title || subtitle || icon || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}

            <div className="min-w-0">
              {title && (
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {title}
                </h3>
              )}

              {subtitle && (
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
}