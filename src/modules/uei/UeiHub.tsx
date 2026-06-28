import React from "react";
import { CloudRain, ClipboardList, FlaskConical, Map, Satellite } from "lucide-react";
import { UEI_FASE_ATUAL, descreverFaseUei } from "./ueiService";

export function UeiHub() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Map className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Unidade Experimental Inteligente
            </h1>
            <p className="mt-2 text-slate-500 max-w-3xl">
              Cada hectare será tratado como uma unidade de análise própria, permitindo comparar áreas gêmeas e avaliar quais manejos geram diferença real de produtividade.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-800">
          <p className="text-sm font-semibold">Fase atual</p>
          <p className="text-sm mt-1">{descreverFaseUei()}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatusCard
            active={UEI_FASE_ATUAL.chuvas}
            icon={<CloudRain className="w-5 h-5" />}
            title="Chuvas"
            description="Volume e distribuição pluviométrica por área."
          />

          <StatusCard
            active={UEI_FASE_ATUAL.ordensServico}
            icon={<ClipboardList className="w-5 h-5" />}
            title="Ordens de Serviço"
            description="Manejo executado por hectare."
          />

          <StatusCard
            active={UEI_FASE_ATUAL.solo}
            icon={<FlaskConical className="w-5 h-5" />}
            title="Solo"
            description="Argila, fertilidade e nutrientes."
          />

          <StatusCard
            active={UEI_FASE_ATUAL.telemetria}
            icon={<Satellite className="w-5 h-5" />}
            title="Telemetria"
            description="Produtividade, máquinas e mapas."
          />
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  active,
  icon,
  title,
  description,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-bold text-sm">{title}</h2>
      </div>
      <p className="text-sm mt-2">{description}</p>
      <p className="text-xs font-bold mt-3">
        {active ? "Ativo agora" : "Próxima fase"}
      </p>
    </div>
  );
}

export default UeiHub;