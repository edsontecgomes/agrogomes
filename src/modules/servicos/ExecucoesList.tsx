import { useState } from 'react';
import {
  FileText,
  History,
  Map as MapIcon,
  MapPin
} from 'lucide-react';

import {
  useExecucoesServico,
  useOrdemServico
} from '../../hooks/useServicos';
import { useSegmentosExecucao } from '../../hooks/useSegmentos';
import {
  useChecklistOrdemResponse,
  useChecklistTemplates
} from '../../hooks/useChecklists';

import {
  Estoque,
  ExecucaoServico,
  Talhao,
  Usuario
} from '../../types';

import { ExecucaoRelatorio } from './ExecucaoRelatorio';
import { ReplayExecucao } from './ReplayExecucao';

interface ExecucoesListProps {
  ordemId: string;
  farmId: string;
  estoque: Estoque[];
  usuarios: Usuario[];
  talhoes: Talhao[];
  usuarioId: string;
  ordemStatus: string;
}

export function ExecucoesList({
  ordemId,
  farmId,
  usuarios,
  talhoes
}: ExecucoesListProps) {
  const { execucoes, loading } = useExecucoesServico(
    ordemId,
    farmId
  );

  const [replayExec, setReplayExec] =
    useState<ExecucaoServico | null>(null);

  const [reportExec, setReportExec] =
    useState<ExecucaoServico | null>(null);

  const { segmentos } = useSegmentosExecucao(farmId);

  const { response: checklistResposta } =
    useChecklistOrdemResponse(
      reportExec?.ordemId ?? null,
      farmId
    );

  const { templates } = useChecklistTemplates(farmId);
  const { ordem } = useOrdemServico(ordemId);

  if (loading) {
    return (
      <div className="text-center py-4 text-slate-500">
        Carregando execuções...
      </div>
    );
  }

  if (execucoes.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500">
        Nenhuma execução registrada.
      </div>
    );
  }

  const reportSegments = reportExec
    ? segmentos.filter(
        segmento => segmento.execucaoId === reportExec.id
      )
    : [];

  const checklistTemplate = checklistResposta
    ? templates.find(
        template =>
          template.id === checklistResposta.checklistId
      )
    : undefined;

  return (
    <div className="space-y-4">
      {replayExec && (
        <ReplayExecucao
          exec={replayExec}
          talhao={talhoes.find(
            talhao => talhao.id === replayExec.talhaoId
          )}
          onClose={() => setReplayExec(null)}
        />
      )}

      {reportExec && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <ExecucaoRelatorio
            exec={reportExec}
            segmentos={reportSegments}
            ordem={ordem || undefined}
            talhao={talhoes.find(
              talhao => talhao.id === reportExec.talhaoId
            )}
            checklistResposta={
              checklistResposta || undefined
            }
            checklistTemplate={checklistTemplate}
            onBack={() => setReportExec(null)}
          />
        </div>
      )}

      {execucoes.map(execucao => {
        const usuario = usuarios.find(
          item => item.id === execucao.operadorId
        );

        const talhao = talhoes.find(
          item => item.id === execucao.talhaoId
        );

        const finalizada =
          execucao.status === 'finalizada';

        const possuiTrajeto =
          Boolean(execucao.path) &&
          (execucao.path?.length ?? 0) > 1;

        const statusLabel =
          execucao.status === 'em_execucao'
            ? 'Executando'
            : execucao.status === 'finalizada'
              ? 'Concluído'
              : 'Pausado';

        const statusClass =
          execucao.status === 'em_execucao'
            ? 'bg-blue-100 text-blue-700'
            : execucao.status === 'finalizada'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600';

        return (
          <div
            key={execucao.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-slate-800">
                  {usuario?.nome || 'Usuário desconhecido'}
                </p>

                <p className="text-sm text-slate-500">
                  Início:{' '}
                  {execucao.dataInicio?.toLocaleString(
                    'pt-BR'
                  ) || 'Aguardando'}
                </p>

                {finalizada && execucao.dataFim && (
                  <p className="text-sm text-slate-500">
                    Fim:{' '}
                    {(execucao.dataFim as Date).toLocaleString(
                      'pt-BR'
                    )}
                  </p>
                )}

                {talhao && (
                  <p className="text-sm text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <MapIcon className="w-4 h-4" />
                    Talhão: {talhao.nome}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-md ${statusClass}`}
                >
                  {statusLabel}
                </span>

                {possuiTrajeto && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReplayExec(execucao)}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      <History className="w-3 h-3" />
                      Replay
                    </button>

                    {finalizada && (
                      <button
                        type="button"
                        onClick={() =>
                          setReportExec(execucao)
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        Relatório
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {(execucao.locationStart ||
              execucao.locationEnd) && (
              <div className="flex flex-col gap-1 mt-2 border-t border-slate-50 pt-2">
                {execucao.locationStart && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Início:{' '}
                    {execucao.locationStart.lat.toFixed(6)},{' '}
                    {execucao.locationStart.lng.toFixed(6)}
                  </p>
                )}

                {execucao.locationEnd && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Fim:{' '}
                    {execucao.locationEnd.lat.toFixed(6)},{' '}
                    {execucao.locationEnd.lng.toFixed(6)}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}