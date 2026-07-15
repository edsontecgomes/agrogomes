import React from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  Database,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type {
  AuditoriaProcessamentoDetalhada,
} from "./typesPainelAuditoria";

type Props = {
  auditoria:
    AuditoriaProcessamentoDetalhada;

  carregando?: boolean;

  onVoltar: () => void;

  onReprocessar?: (
    auditoria:
      AuditoriaProcessamentoDetalhada,
  ) => void;
};

function formatarDuracao(
  milissegundos?: number,
): string {
  if (
    milissegundos === undefined
  ) {
    return "Não calculada";
  }

  if (milissegundos < 1000) {
    return `${milissegundos} ms`;
  }

  const segundos =
    milissegundos / 1000;

  if (segundos < 60) {
    return `${segundos.toFixed(2)} s`;
  }

  return `${(
    segundos / 60
  ).toFixed(2)} min`;
}

function formatarData(
  valor?: string,
): string {
  if (!valor) {
    return "Não informado";
  }

  const data =
    new Date(valor);

  return Number.isNaN(
    data.getTime(),
  )
    ? valor
    : data.toLocaleString(
        "pt-BR",
      );
}

function obterIconeEtapa(
  status: string,
) {
  switch (status) {
    case "concluida":
      return CheckCircle2;

    case "concluida_com_alertas":
      return AlertTriangle;

    case "falhou":
      return XCircle;

    case "processando":
      return Clock3;

    default:
      return Circle;
  }
}

function obterClasseEtapa(
  status: string,
): string {
  switch (status) {
    case "concluida":
      return "text-emerald-600";

    case "concluida_com_alertas":
      return "text-amber-600";

    case "falhou":
      return "text-red-600";

    case "processando":
      return "text-blue-600";

    default:
      return "text-slate-400";
  }
}

export function AuditoriaProcessamentoDetalhes({
  auditoria,
  carregando = false,
  onVoltar,
  onReprocessar,
}: Props) {
  const podeReprocessar =
    auditoria.status ===
      "falhou" ||
    auditoria.status ===
      "processado_com_alertas" ||
    auditoria.erros.some(
      (erro) =>
        erro.recuperavel,
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onVoltar}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />

          Voltar aos processamentos
        </button>

        {podeReprocessar &&
          onReprocessar && (
            <button
              type="button"
              disabled={carregando}
              onClick={() =>
                onReprocessar(
                  auditoria,
                )
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />

              Reprocessar
            </button>
          )}
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">
              Processamento
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900 break-all">
              {auditoria.processamentoId}
            </h2>

            <p className="mt-2 text-sm text-slate-500 break-all">
              {auditoria.chaveIdempotencia}
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {auditoria.status}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Evento
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {auditoria.tipoEvento}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Tentativas
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {auditoria.tentativas}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Duração
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatarDuracao(
                auditoria.duracaoTotalMs,
              )}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Finalizado
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-900">
              {formatarData(
                auditoria.finalizadoEm,
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Etapas do pipeline
        </h3>

        <div className="mt-5 space-y-3">
          {auditoria.etapas.map(
            (etapa) => {
              const Icone =
                obterIconeEtapa(
                  etapa.status,
                );

              return (
                <div
                  key={etapa.etapa}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 p-4"
                >
                  <Icone
                    className={`w-5 h-5 shrink-0 mt-0.5 ${obterClasseEtapa(
                      etapa.status,
                    )}`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <p className="text-sm font-bold text-slate-900">
                        {etapa.etapa}
                      </p>

                      <span className="text-xs font-semibold text-slate-500">
                        {etapa.status}
                      </span>
                    </div>

                    {etapa.mensagem && (
                      <p className="mt-1 text-sm text-slate-600">
                        {etapa.mensagem}
                      </p>
                    )}

                    <div className="mt-2 flex gap-4 flex-wrap text-xs text-slate-500">
                      <span>
                        Tentativas:{" "}
                        {etapa.tentativas ??
                          0}
                      </span>

                      {etapa.duracaoMs !==
                        undefined && (
                        <span>
                          Duração:{" "}
                          {formatarDuracao(
                            etapa.duracaoMs,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />

            <h3 className="text-base font-bold text-slate-900">
              Alertas
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {auditoria.alertas.length ===
            0 ? (
              <p className="text-sm text-slate-500">
                Nenhum alerta registrado.
              </p>
            ) : (
              auditoria.alertas.map(
                (alerta, indice) => (
                  <div
                    key={`${alerta}-${indice}`}
                    className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-800"
                  >
                    {alerta}
                  </div>
                ),
              )
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />

            <h3 className="text-base font-bold text-slate-900">
              Erros
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {auditoria.erros.length ===
            0 ? (
              <p className="text-sm text-slate-500">
                Nenhum erro registrado.
              </p>
            ) : (
              auditoria.erros.map(
                (erro, indice) => (
                  <div
                    key={`${erro.codigo}-${indice}`}
                    className="rounded-xl bg-red-50 border border-red-100 p-3"
                  >
                    <p className="text-xs font-bold text-red-800">
                      {erro.codigo}
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {erro.mensagem}
                    </p>

                    <p className="mt-2 text-xs text-red-600">
                      Recuperável:{" "}
                      {erro.recuperavel
                        ? "sim"
                        : "não"}
                    </p>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />

          <h3 className="text-base font-bold text-slate-900">
            Registros gerados
          </h3>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-3 text-sm">
          <IdCard
            rotulo="Evento Agronômico"
            valor={
              auditoria.eventoAgronomicoId
            }
          />

          <IdCard
            rotulo="Resultado Científico"
            valor={
              auditoria.resultadoCientificoId
            }
          />

          <IdCard
            rotulo="Resultado Estatístico"
            valor={
              auditoria.resultadoEstatisticoId
            }
          />

          <IdCard
            rotulo="Aprendizados"
            valor={
              auditoria.aprendizadoIds
                .length
                ? `${auditoria.aprendizadoIds.length} registro(s)`
                : undefined
            }
          />

          <IdCard
            rotulo="Conhecimentos"
            valor={
              auditoria.conhecimentoIds
                .length
                ? `${auditoria.conhecimentoIds.length} registro(s)`
                : undefined
            }
          />

          <IdCard
            rotulo="Recomendações"
            valor={
              auditoria.recomendacaoIds
                .length
                ? `${auditoria.recomendacaoIds.length} registro(s)`
                : undefined
            }
          />
        </div>
      </section>
    </div>
  );
}

function IdCard({
  rotulo,
  valor,
}: {
  rotulo: string;
  valor?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 min-w-0">
      <p className="text-xs text-slate-500">
        {rotulo}
      </p>

      <p className="mt-1 font-semibold text-slate-900 break-all">
        {valor ?? "Não gerado"}
      </p>
    </div>
  );
}