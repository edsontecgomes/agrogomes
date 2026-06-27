import React from "react";

type PageContainerProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "default" | "wide" | "full";
};

export function PageContainer({
  title,
  subtitle,
  children,
  actions,
  maxWidth = "default",
}: PageContainerProps) {
  const maxWidthClass = {
    default: "max-w-7xl",
    wide: "max-w-[1500px]",
    full: "max-w-none",
  }[maxWidth];

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClass}`}>
      {(title || subtitle || actions) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
}