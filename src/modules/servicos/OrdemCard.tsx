import React, { useState } from 'react';
import { OrdemServico, Usuario, Estoque, Talhao } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  StopCircle, 
  MapPin, 
  Trash2 
} from 'lucide-react';
import { useExecucoesServico } from '../../hooks/useServicos';
import { ExecucoesList } from './ExecucoesList';

interface OrdemCardProps {
  ordem: OrdemServico;
  usuarioId: string;
  usuarios: Usuario[];
  talhoes: Talhao[];
  estoque: Estoque[];
  canManage: boolean;
  activeExecs: any[];
  myExec: any;
  onStart: (ordem: OrdemServico) => void;
  onFinish: (execId: string, ordem: OrdemServico) => void;
  onCloseOS: (ordemId: string) => void;
}

export function OrdemCard({ 
  ordem, 
  usuarioId, 
  usuarios, 
  talhoes, 
  estoque, 
  canManage,
  activeExecs,
  myExec,
  onStart,
  onFinish,
  onCloseOS
}: OrdemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{ordem.titulo}</h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {ordem.tipoOperacao}
              </span>
              {activeExecs.length > 0 && (
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  {activeExecs.length} operador{activeExecs.length > 1 ? 'es' : ''} ativo{activeExecs.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {talhoes.find(t => t.id === ordem.talhaoId)?.nome || 'Talhão não identificado'}
            </div>
            {(ordem.maquinaNome || ordem.implementoNome) && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {ordem.maquinaNome && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-50 rounded-lg border border-slate-200">
                    🚜 {ordem.maquinaNome}
                  </span>
                )}
                {ordem.implementoNome && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-50 rounded-lg border border-slate-200">
                    🛠️ {ordem.implementoNome}
                  </span>
                )}
              </div>
            )}
            <p className="text-slate-600 text-sm italic line-clamp-2 mt-2">{ordem.descricao}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={ordem.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {ordem.status !== 'finalizada' && (
            myExec ? (
              <button
                onClick={() => setConfirmFinish(true)}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white hover:bg-red-700 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                <StopCircle className="w-4 h-4" />
                Finalizar Minha Parte
              </button>
            ) : (
              <button
                onClick={() => onStart(ordem)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                <PlayCircle className="w-4 h-4" />
                Executar Esta OS
              </button>
            )
          )}
          
          {canManage && ordem.status !== 'finalizada' && (
            <button
              onClick={() => onCloseOS(ordem.id)}
              className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 text-sm font-bold rounded-xl transition-colors border border-emerald-100"
            >
              <CheckCircle2 className="w-4 h-4" />
              Encerrar OS
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-bold rounded-xl transition-colors ml-auto"
          >
            {expanded ? 'Fechar Detalhes' : 'Ver Execuções'}
          </button>
        </div>
      </div>

      {confirmFinish && myExec && (
        <div className="border-t border-slate-100 bg-slate-50 p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Confirmar Finalização</h4>
            <button onClick={() => setConfirmFinish(false)} className="text-slate-400 hover:text-slate-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600">Sua execução será encerrada e os dados salvos. Se houverem outros operadores, eles continuarão ativos.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmFinish(false)}
              className="px-4 py-2 text-sm font-bold text-slate-500"
            >
              Voltar
            </button>
            <button
              onClick={() => onFinish(myExec.id, ordem)}
              className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-6 shadow-inner">
          <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Histórico de Operadores</h4>
          <ExecucoesList 
            ordemId={ordem.id} 
            estoque={estoque} 
            usuarios={usuarios} 
            usuarioId={usuarioId}
            ordemStatus={ordem.status}
            talhoes={talhoes}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrdemServico['status'] }) {
  switch (status) {
    case 'pendente':
      return <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider"><Clock className="w-3 h-3" /> Pendente</span>;
    case 'em_execucao':
      return <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider shadow-sm"><PlayCircle className="w-3 h-3" /> Em Execução</span>;
    case 'parcial':
      return <span className="px-3 py-1 bg-slate-300 text-slate-800 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Parcial</span>;
    case 'finalizada':
      return <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Finalizada</span>;
    default:
      return null;
  }
}
