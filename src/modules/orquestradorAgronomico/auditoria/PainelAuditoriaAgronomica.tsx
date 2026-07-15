import React, {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";

import { AuditoriaProcessamentoDetalhes } from "./AuditoriaProcessamentoDetalhes";
import { ProcessamentoAuditoriaCard } from "./ProcessamentoAuditoriaCard";
import { usePainelAuditoria } from "./usePainelAuditoria";

import type {
  AuditoriaProcessamentoDetalhada,
} from "./typesPainelAuditoria";

import type {
  StatusProcessamentoAgronomico,
} from "../types";

type Props = {
  farmId: string;

  onReprocessar?: (
    auditoria:
      AuditoriaProcessamentoDetalhada,
  ) => void;
};

type FiltroStatus =
  | "todos"
  | StatusProcessamentoAgronomico;

export function PainelAuditoriaAgronomica({
  farmId,
  onReprocessar,
}: Props) {
  const [
    status,
    setStatus,
  ] = useState<FiltroStatus>(
    "todos",
  );

  const [
    tipoEvento,
    setTipoEvento,
  ] = useState("");

  const [
    busca,
    setBusca,
  ] = useState("");

  const painel =
    usePainelAuditoria({
      farmId,

      status:
        status === "todos"
          ? undefined
          : status,

      tipoEvento:
        tipoEvento ||
        undefined,

      limite:
        150,
    });

  const processamentosFiltrados =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase();

      if (!termo) {
        return painel.processamentos;
      }

      return painel.processamentos.filter(
        (processamento) =>
          processamento.processamentoId
            .toLowerCase()
            .includes(termo) ||
          processamento.chaveIdempotencia
            .toLowerCase()
            .includes(termo) ||
          processamento.tipoEvento
            .toLowerCase()
            .includes(termo) ||
          processamento.talhaoId
            ?.toLowerCase()
            .includes(termo),
      );
    }, [
      painel.processamentos,
      busca,
    ]);

  if (
    painel.auditoriaSelecionada
  ) {
    return (
      <AuditoriaProcessamentoDetalhes
        auditoria={
          painel.auditoriaSelecionada
        }
        carregando={
          painel.carregandoDetalhes
        }
        onVoltar={
          painel.limparSelecao
        }
        onReprocessar={
          onReprocessar
        }
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Orquestrador Agronômico
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Auditoria do Pipeline
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe cada evento desde a
            recepção até a recomendação.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void painel.carregar()
          }
          disabled={
            painel.carregando
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          <RefreshCcw
            className={`w-4 h-4 ${
              painel.carregando
                ? "animate-spin"
                : ""
            }`}
          />

          Atualizar
        </button>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <ResumoCard
          titulo="Total"
          valor={
            painel.resumo
              .totalProcessamentos
          }
        />

        <ResumoCard
          titulo="Processados"
          valor={
            painel.resumo
              .totalProcessados
          }
          Icone={
            CheckCircle2
          }
        />

        <ResumoCard
          titulo="Com alertas"
          valor={
            painel.resumo
              .totalComAlertas
          }
          Icone={
            AlertTriangle
          }
        />

        <ResumoCard
          titulo="Falhas"
          valor={
            painel.resumo
              .totalFalhas
          }
          Icone={
            XCircle
          }
        />

        <ResumoCard
          titulo="Em andamento"
          valor={
            painel.resumo
              .totalEmAndamento
          }
          Icone={
            LoaderCircle
          }
        />

        <ResumoCard
          titulo="Reprocessáveis"
          valor={
            painel.resumo
              .totalReprocessaveis
          }
          Icone={
            RefreshCcw
          }
        />
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              value={busca}
              onChange={(evento) =>
                setBusca(
                  evento.target.value,
                )
              }
              placeholder="Buscar ID, chave ou talhão"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500"
            />
          </label>

          <select
            value={status}
            onChange={(evento) =>
              setStatus(
                evento.target
                  .value as FiltroStatus,
              )
            }
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 bg-white"
          >
            <option value="todos">
              Todos os status
            </option>

            <option value="processado">
              Processados
            </option>

            <option value="processado_com_alertas">
              Com alertas
            </option>

            <option value="falhou">
              Falhas
            </option>

            <option value="processando">
              Em processamento
            </option>
          </select>

          <select
            value={tipoEvento}
            onChange={(evento) =>
              setTipoEvento(
                evento.target.value,
              )
            }
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 bg-white"
          >
            <option value="">
              Todos os eventos
            </option>

            <option value="chuva">
              Chuva
            </option>

            <option value="plantio">
              Plantio
            </option>

            <option value="adubacao">
              Adubação
            </option>

            <option value="pulverizacao">
              Pulverização
            </option>

            <option value="colheita">
              Colheita
            </option>

            <option value="execucao_ordem">
              Execução de ordem
            </option>
          </select>
        </div>
      </section>

      {painel.erro && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {painel.erro}
        </div>
      )}

      {painel.carregando ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-500">
          <LoaderCircle className="w-8 h-8 animate-spin" />

          <p className="mt-3 text-sm">
            Carregando processamentos...
          </p>
        </div>
      ) : processamentosFiltrados.length ===
        0 ? (
        <div className="py-16 bg-white border border-dashed border-slate-300 rounded-2xl text-center">
          <p className="text-sm font-semibold text-slate-700">
            Nenhum processamento encontrado
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Execute o cenário piloto ou
            altere os filtros.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {processamentosFiltrados.map(
            (processamento) => (
              <ProcessamentoAuditoriaCard
                key={
                  processamento.id
                }
                processamento={
                  processamento
                }
                onAbrir={
                  painel.selecionarProcessamento
                }
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

type ResumoCardProps = {
  titulo: string;

  valor: number;

  Icone?: React.ComponentType<{
    className?: string;
  }>;
};

function ResumoCard({
  titulo,
  valor,
  Icone,
}: ResumoCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          {titulo}
        </p>

        {Icone && (
          <Icone className="w-4 h-4 text-slate-400" />
        )}
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {valor}
      </p>
    </div>
  );
}