import React from "react";

type SectionGridProps = {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

export function SectionGrid({
  children,
  columns = 3,
  className = "",
}: SectionGridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-4 ${className}`}>
      {children}
    </div>
  );
}