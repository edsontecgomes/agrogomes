import React from "react";

type AgronomiaHubProps = {
  onOpenModule?: (moduleId: string) => void;
};

export function AgronomiaHub({ onOpenModule }: AgronomiaHubProps) {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-900">Agronomia IA</h1>
        <p className="mt-2 text-slate-500">
          Central de solo, chuvas, talhões, produtividade e recomendações inteligentes.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => onOpenModule?.("chuvas")}
            className="p-5 rounded-2xl border border-slate-200 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
          >
            <h2 className="font-bold text-slate-900">Chuvas</h2>
            <p className="text-sm text-slate-500 mt-1">
              Histórico pluviométrico e pluviômetros.
            </p>
          </button>

          <button
            onClick={() => onOpenModule?.("talhoes")}
            className="p-5 rounded-2xl border border-slate-200 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
          >
            <h2 className="font-bold text-slate-900">Talhões</h2>
            <p className="text-sm text-slate-500 mt-1">
              Áreas, mapas e histórico dos talhões.
            </p>
          </button>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-left opacity-70">
            <h2 className="font-bold text-slate-900">Solo</h2>
            <p className="text-sm text-slate-500 mt-1">
              Análises físicas, químicas e recomendações futuras.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgronomiaHub;