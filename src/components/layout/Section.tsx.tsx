import React from "react";

type SectionProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function Section({
  title,
  subtitle,
  children,
  actions,
  className = "",
}: SectionProps) {
  return (
    <section
      className={`
        bg-white
        rounded-3xl
        border
        border-slate-200
        shadow-sm
        p-6
        ${className}
      `}
    >
      {(title || subtitle || actions) && (
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-slate-900">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </header>
      )}

      {children}
    </section>
  );
}