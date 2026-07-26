import React, { useMemo } from 'react';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  Map as MapIcon, 
  TrendingUp, 
  Clock, 
  Navigation,
  Signal,
  SignalLow,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { useTodasExecucoesServico, useOrdensServico } from '../../hooks/useServicos';
import { useSegmentosExecucao } from '../../hooks/useSegmentos';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useTalhoes } from '../../hooks/useTalhoes';
import { useEstoque } from '../../hooks/useEstoque';
import { ExecucoesMap } from './ExecucoesMap';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useFarm } from '../../contexts/FarmContext';

interface CentralOperacionalProps {
  farmId: string;
}

export function CentralOperacional({ farmId }: CentralOperacionalProps) {
  const { activeFarm } = useFarm();
  const { execucoes, loading: loadingExecs } = useTodasExecucoesServico(farmId);
  const { segmentos, loading: loadingSegments } = useSegmentosExecucao(farmId);
  const { talhoes } = useTalhoes(farmId);
  const { usuarios } = useUsuarios(farmId);
  const { estoque } = useEstoque(farmId);
  const { ordens } = useOrdensServico(farmId);

  const activeExecutions = useMemo(() => {
    return execucoes.filter(e => e.status === 'em_execucao');
  }, [execucoes]);

  const stats = useMemo(() => {
    const totalDist = segmentos.reduce((acc, s) => acc + (s.metadata?.distanciaPercorrida || 0), 0);
    const finishedToday = execucoes.filter(e => {
      if (e.status !== 'finalizada' || !e.dataFim) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return e.dataFim >= today;
    }).length;

    // Estimate hectares: approx width * distance
    let totalHectares = 0;
    segmentos.forEach(s => {
      const width = s.larguraOperacional || 0;
      const dist = s.metadata?.distanciaPercorrida || 0;
      totalHectares += (width * dist) / 10000;
    });

    return {
      activeOperators: activeExecutions.length,
      totalDistKm: totalDist / 1000,
      totalHectares,
      finishedToday,
      totalInProgress: activeExecutions.length
    };
  }, [activeExecutions, segmentos, execucoes]);

  const alerts = useMemo(() => {
    const list: any[] = [];
    const now = Date.now();

    activeExecutions.forEach(exec => {
      const lastPoint = exec.path && exec.path.length > 0 ? exec.path[exec.path.length - 1] : null;

      if (!lastPoint) {
        list.push({
          id: `no-gps-${exec.id}`,
          type: 'critical',
          message: `${exec.operadorNome}: Sem sinal GPS inicial`,
          exec,
          timestamp: exec.dataInicio.getTime()
        });
        return;
      }

      const delay = now - lastPoint.timestamp;
      if (delay > 300000) { // 5 minutes
        list.push({
          id: `offline-${exec.id}`,
          type: 'warning',
          message: `${exec.operadorNome}: Operador possivelmente offline (+5 min)`,
          exec,
          timestamp: lastPoint.timestamp
        });
      }

      if (lastPoint.accuracy && lastPoint.accuracy > 20) {
        list.push({
          id: `accuracy-${exec.id}`,
          type: 'info',
          message: `${exec.operadorNome}: Baixa precisão GPS (${lastPoint.accuracy.toFixed(0)}m)`,
          exec,
          timestamp: lastPoint.timestamp
        });
      }
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [activeExecutions]);

  if (loadingExecs || loadingSegments) {
    return <div className="text-center py-12 text-slate-500">Carregando Central Operacional...</div>;
  }

  return (
    <div className="space-y-6">
      {talhoes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-600">
               <AlertCircle className="w-5 h-5" />
             </div>
             <div>
               <h4 className="text-sm font-bold text-amber-900 leading-none mb-1">Central em Modo Limitado</h4>
               <p className="text-xs text-amber-700">A visualização espacial requer o cadastro dos talhões da fazenda.</p>
             </div>
          </div>
          <button 
            onClick={() => {
              const event = new CustomEvent('set-active-module', { detail: 'talhoes' });
              window.dispatchEvent(event);
            }}
            className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-200/50"
          >
            Mapear Áreas
          </button>
        </div>
      )}

      {/* Resumo Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativos</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.activeOperators}</p>
          <p className="text-xs text-slate-500">Operadores em campo</p>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hectares</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.totalHectares.toFixed(1)}</p>
          <p className="text-xs text-slate-500">Total operado (est.)</p>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Navigation className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distância</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.totalDistKm.toFixed(1)} km</p>
          <p className="text-xs text-slate-500">Percorrido total</p>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finalizadas</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.finishedToday}</p>
          <p className="text-xs text-slate-500">Execuções hoje</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operadores Ativos e Alertas */}
        <div className="lg:col-span-1 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Operadores Ativos</h3>
            </div>

            <div className="space-y-4">
              {activeExecutions.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl p-8 text-center border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">Nenhum operador ativo no momento</p>
                </div>
              ) : (
                activeExecutions.map(exec => {
                  const lastPoint = exec.path && exec.path.length > 0 ? exec.path[exec.path.length - 1] : null;
                  const ordem = ordens.find(o => o.id === exec.ordemId);
                  const produtosExecucao =
                    exec.produtos && exec.produtos.length > 0
                      ? exec.produtos
                      : ordem?.produtos || [];
                  
                  return (
                    <motion.div 
                      key={exec.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 group hover:border-blue-200 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{exec.operadorNome}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {ordem?.tipoOperacao || 'Operação'} • {talhoes.find(t => t.id === exec.talhaoId)?.nome || 'Campo'}
                          </p>
                          {(exec.maquinaNome || exec.implementoNome) && (
                            <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider flex flex-wrap items-center gap-1">
                              {exec.maquinaNome && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">🚜 {exec.maquinaNome}</span>}
                              {exec.implementoNome && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">🛠️ {exec.implementoNome}</span>}
                            </p>
                          )}
                          {produtosExecucao.length > 0 && (
                            <div className="mt-2 text-[9px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-wrap gap-1 items-center">
                              <span className="font-bold text-slate-600 block w-full text-[8px] uppercase tracking-wider mb-0.5">Insumos Planejados:</span>
                              {produtosExecucao.map((p, pIdx) => (
                                <span key={pIdx} className="bg-white border text-slate-700 px-1.5 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                  📦 {p.nome || 'Produto'}: {p.dose} {p.unidade}
                                  {p.lote ? ` • lote ${p.lote}` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {lastPoint ? (
                             <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                               <Signal className="w-3 h-3" />
                               Ativo
                             </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                               <WifiOff className="w-3 h-3" />
                               Desconectado
                             </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Velocidade</p>
                          <p className="text-xs font-bold text-slate-700">-- km/h</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Precisão</p>
                          <p className="text-xs font-bold text-slate-700">{lastPoint?.accuracy?.toFixed(0) || '--'}m</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Última At.</p>
                          <p className="text-xs font-bold text-slate-700">
                            {lastPoint ? formatDistanceToNow(lastPoint.timestamp, { addSuffix: true, locale: ptBR }).replace('aproximadamente ', '') : '--'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-rose-600 rounded-lg text-white">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Alertas Operacionais</h3>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                 {alerts.length === 0 ? (
                   <div className="p-8 text-center">
                     <p className="text-xs text-slate-400">Nenhum alerta no momento</p>
                   </div>
                 ) : (
                   alerts.map(alert => (
                     <div key={alert.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                        <div className={`p-1.5 rounded-lg ${
                          alert.type === 'critical' ? 'bg-rose-100 text-rose-600' :
                          alert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {alert.type === 'critical' ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight">{alert.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </section>
        </div>

        {/* Mapa Realtime */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <MapIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800">Visualização em Tempo Real</h3>
          </div>
          
          <div className="space-y-4">
            <ExecucoesMap 
              farmId={farmId} 
              usuarios={usuarios} 
              estoque={estoque}
            />
            {/* Note: Ideally we'd have a specialized 'LiveMap' showing markers, 
                but ExecucoesMap is a great start. We can enhance it later. */}
          </div>
        </div>
      </div>
    </div>
  );
}
