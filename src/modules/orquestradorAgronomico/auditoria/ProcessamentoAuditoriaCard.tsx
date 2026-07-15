import React from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LoaderCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type {
  ProcessamentoAuditoriaResumo,
} from "./typesPainelAuditoria";

type Props = {
  processamento:
    ProcessamentoAuditoriaResumo;

  onAbrir: (
    processamentoId: string,
  ) => void;
};

function formatarData(
  valor?: string,
): string {
  if (!valor) {
    return "Sem data";
  }

  const data =
    new Date(valor);

  if (
    Number.isNaN(
      data.getTime(),
    )
  ) {
    return valor;
  }

  return data.toLocaleString(
    "pt-BR",
  );
}

function obterStatusVisual(
  status:
    ProcessamentoAuditoriaResumo["status"],
) {
  switch (status) {
    case "processado":
      return {
        texto:
          "Processado",

        classe:
          "bg-emerald-50 text-emerald-700 border-emerald-200",

        Icone:
          CheckCircle2,
      };

    case "processado_com_alertas":
      return {
        texto:
          "Com alertas",

        classe:
          "bg-amber-50 text-amber-700 border-amber-200",

        Icone:
          AlertTriangle,
      };

    case "falhou":
      return {
        texto:
          "Falhou",

        classe:
          "bg-red-50 text-red-700 border-red-200",

        Icone:
          XCircle,
      };

    case "processando":
    case "validando":
    case "recebido":
      return {
        texto:
          "Em andamento",

        classe:
          "bg-blue-50 text-blue-700 border-blue-200",

        Icone:
          LoaderCircle,
      };

    default:
      return {
        texto:
          "Cancelado",

        classe:
          "bg-slate-100 text-slate-600 border-slate-200",

        Icone:
          XCircle,
      };
  }
}

export function ProcessamentoAuditoriaCard({
  processamento,
  onAbrir,
}: Props) {
  const status =
    obterStatusVisual(
      processamento.status,
    );

  const IconeStatus =
    status.Icone;

  const totalConcluidas =
    processamento.etapas.filter(
      (etapa) =>
        etapa.status ===
          "concluida" ||
        etapa.status ===
          "concluida_com_alertas",
    ).length;

  return (
    <button
      type="button"
      onClick={() =>
        onAbrir(
          processamento.processamentoId,
        )
      }
      className="w-full text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${status.classe}`}
            >
              <IconeStatus
                className={`w-3.5 h-3.5 ${
                  processamento.status ===
                    "processando"
                    ? "animate-spin"
                    : ""
                }`}
              />

              {status.texto}
            </span>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {processamento.tipoEvento}
            </span>
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-900 truncate">
            {processamento.processamentoId}
          </p>

          <p className="mt-1 text-xs text-slate-500 truncate">
            Chave:{" "}
            {processamento.chaveIdempotencia}
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Etapas
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {totalConcluidas}/
            {processamento.etapas.length}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Alertas
          </p>

          <p className="mt-1 text-sm font-bold text-amber-700">
            {processamento.totalAlertas}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Erros
          </p>

          <p className="mt-1 text-sm font-bold text-red-700">
            {processamento.totalErros}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Tentativas
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />

            <p className="text-sm font-bold text-slate-900">
              {processamento.tentativas}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Clock3 className="w-3.5 h-3.5" />

        {formatarData(
          processamento.finalizadoEm ??
            processamento.atualizadoEm ??
            processamento.iniciadoEm,
        )}
      </div>

      {processamento.etapaComFalha && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          Falha em:{" "}
          <strong>
            {processamento.etapaComFalha}
          </strong>
        </div>
      )}
    </button>
  );
}