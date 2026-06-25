import React, { useMemo, useState } from 'react';
import { 
  Calendar, 
  Droplets, 
  Activity, 
  User, 
  Map as MapIcon, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Navigation,
  FileText,
  History
} from 'lucide-react';
import { Talhao, ExecucaoServico, ChuvaComunitaria, SegmentoExecucao, OrdemServico } from '../../types';
import { 
  gerarEventosTalhao, 
  calcularChuvaAcumulada, 
  gerarResumoTalhao,
  TalhaoEvent
} from '../../utils/agronomicUtils';
import { useTodasExecucoesServico, useOrdensServico } from '../../hooks/useServicos';
import { useChuvasComunitarias } from '../../hooks/useChuvasComunitarias';
import { useSegmentosExecucao } from '../../hooks/useSegmentos';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReplayExecucao } from '../servicos/ReplayExecucao';
import { ExecucoesMap } from '../servicos/ExecucoesMap';

interface TalhaoHistoricoProps {
  talhao: Talhao;
  onClose: () => void;
}

export function TalhaoHistorico({ talhao, onClose }: TalhaoHistoricoProps) {
  const { execucoes, loading: loadingExecs } = useTodasExecucoesServico(talhao.farmId);
  const { chuvasComunitarias, loading: loadingChuvas } = useChuvasComunitarias(talhao.farmId);
  const { segmentos, loading: loadingSegments } = useSegmentosExecucao(talhao.farmId);
  const { ordens } = useOrdensServico(talhao.farmId);

  const [replayExec, setReplayExec] = useState<ExecucaoServico | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'map' | 'details'>('timeline');

  const events = useMemo(() => {
    return gerarEventosTalhao(talhao.id, execucoes, chuvasComunitarias, talhao.geometria);
  }, [talhao.id, execucoes, chuvasComunitarias, talhao.geometria]);

  const resumo = useMemo(() => {
    return gerarResumoTalhao(talhao.id, execucoes, segmentos, chuvasComunitarias);
  }, [talhao.id, execucoes, segmentos, chuvasComunitarias]);

  const chuvaSemanal = useMemo(() => calcularChuvaAcumulada(chuvasComunitarias, 'week'), [chuvasComunitarias]);
  const chuvaMensal = useMemo(() => calcularChuvaAcumulada(chuvasComunitarias, 'month'), [chuvasComunitarias]);

  const chartData = useMemo(() => {
    // Last 7 days chart
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const dayRain = chuvasComunitarias
        .filter(c => {
           const ts = c.timestamp instanceof Date ? c.timestamp : (c.timestamp as any).toDate();
           return ts >= startOfDay && ts <= endOfDay;
        })
        .reduce((acc, c) => acc + c.mm, 0);

      data.push({
        name: format(d, 'EEE', { locale: ptBR }),
        mm: dayRain
      });
    }
    return data;
  }, [chuvasComunitarias]);

  if (loadingExecs || loadingChuvas || loadingSegments) {
    return (
      <div className="fixed inset-0 z-[150] bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Carregando Diário Agronômico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{talhao.nome}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              {talhao.area.toFixed(2)} Hectares • Diário Agronômico
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'timeline' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
            }`}
          >
            Timeline
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'map' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
            }`}
          >
            Mapa
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          
          {/* Resumo Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuva (Mês)</span>
               </div>
               <p className="text-2xl font-black text-slate-800">{chuvaMensal.toFixed(1)} mm</p>
               <p className="text-xs text-slate-500">Acumulado 30 dias</p>
            </div>
            
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operações</span>
               </div>
               <p className="text-2xl font-black text-slate-800">{resumo.totalOperations}</p>
               <p className="text-xs text-slate-500">Execuções realizadas</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distância</span>
               </div>
               <p className="text-2xl font-black text-slate-800">{resumo.totalDistKm.toFixed(1)} km</p>
               <p className="text-xs text-slate-500">Percorrido no campo</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipe</span>
               </div>
               <p className="text-2xl font-black text-slate-800">{resumo.operatorCount}</p>
               <p className="text-xs text-slate-500">Operadores ativos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline Column */}
            <div className="lg:col-span-2 space-y-6">
              {viewMode === 'timeline' ? (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
                      <History className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-800">Timeline Operacional</h3>
                  </div>

                  <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {events.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 ml-8">
                        <p className="text-sm text-slate-500">Nenhuma atividade registrada para este talhão.</p>
                      </div>
                    ) : (
                      events.map(event => (
                        <div key={event.id} className="relative pl-12 group">
                          {/* Dot */}
                          <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-slate-50 z-10 flex items-center justify-center text-white ${
                            event.type === 'chuva' ? 'bg-blue-500' :
                            event.type === 'execucao_inicio' ? 'bg-emerald-500' :
                            event.type === 'execucao_fim' ? 'bg-slate-800' :
                            'bg-amber-500'
                          }`}>
                            {event.type === 'chuva' && <Droplets className="w-4 h-4" />}
                            {event.type === 'execucao_inicio' && <Activity className="w-4 h-4" />}
                            {event.type === 'execucao_fim' && <CheckCircle className="w-4 h-4" />}
                            {event.type === 'pausa' && <Clock className="w-4 h-4" />}
                          </div>

                          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm group-hover:border-emerald-200 group-hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-slate-900">{event.descricao}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                  {format(event.timestamp, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              {event.operadorNome && (
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3" />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{event.operadorNome}</span>
                                </div>
                              )}
                            </div>

                            {event.type === 'chuva' && (
                              <div className="mt-3 flex items-center gap-4">
                                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-bold border border-blue-100">
                                  Volumen: {event.valor} {event.unidade}
                                </div>
                              </div>
                            )}

                            {event.type.startsWith('execucao') && event.data && (event.data.maquinaNome || event.data.implementoNome) && (
                              <div className="mt-2.5 flex flex-wrap gap-2">
                                {event.data.maquinaNome && (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Máquina: {event.data.maquinaNome}
                                  </span>
                                )}
                                {event.data.implementoNome && (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Implemento: {event.data.implementoNome}
                                  </span>
                                )}
                              </div>
                            )}

                            {event.type.startsWith('execucao') && event.data && (
                              (() => {
                                const matchedOrdem = ordens.find(o => o.id === event.data.ordemId);
                                if (matchedOrdem && matchedOrdem.produtos && matchedOrdem.produtos.length > 0) {
                                  const isAreaBased = ['Plantio', 'Pulverizacao', 'Adubacao'].includes(matchedOrdem.tipoOperacao);
                                  return (
                                    <div className="mt-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-left">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Insumos e Consumo de Estoque</p>
                                      {matchedOrdem.produtos.map((p, pIdx) => {
                                        const qtyConsumida = isAreaBased && talhao.area > 0 ? (p.dose || 0) * talhao.area : (p.dose || 0);
                                        return (
                                          <div key={pIdx} className="flex justify-between items-center text-[11px] text-slate-700">
                                            <span className="font-bold text-slate-800">{p.nome || 'Insumo'}</span>
                                            <span className="text-slate-500 font-medium font-mono">
                                              Dose: {p.dose} {p.unidade} • Qtd: <strong className="text-rose-600 font-bold">{qtyConsumida.toFixed(2)} {p.unidade}</strong>
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                }
                                return null;
                              })()
                            )}

                            {event.type.startsWith('execucao') && event.data && (
                              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                                <button 
                                  onClick={() => setReplayExec(event.data)}
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"
                                >
                                  <History className="w-4 h-4" />
                                  Ver Replay
                                </button>
                                <button 
                                  onClick={() => {
                                    setReplayExec(event.data);
                                    setViewMode('map');
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"
                                >
                                  <MapIcon className="w-4 h-4" />
                                  Ver no Mapa
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              ) : (
                <section className="bg-white rounded-3xl overflow-hidden border border-slate-100 h-[600px] shadow-lg sticky top-6">
                  <ExecucoesMap 
                    farmId={talhao.farmId}
                    talhaoId={talhao.id}
                    showAll={false}
                  />
                </section>
              )}
            </div>

            {/* Sidebar Stats Column */}
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">Precipitação</h3>
                  <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                    Semana: {chuvaSemanal}mm
                  </div>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 900, color: '#1e293b', fontSize: '10px' }}
                      />
                      <Bar 
                        dataKey="mm" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Ordens Relacionadas</h3>
                <div className="space-y-4">
                  {ordens.filter(o => o.talhaoId === talhao.id).map(ordem => (
                    <div key={ordem.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-all cursor-pointer">
                       <div className="flex items-center gap-3 mb-2">
                         <div className="w-8 h-8 bg-white text-slate-700 rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                           <FileText className="w-4 h-4" />
                         </div>
                         <h4 className="font-bold text-slate-800 text-sm leading-tight">{ordem.titulo}</h4>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ordem.tipoOperacao}</span>
                         <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           ordem.status === 'finalizada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {ordem.status}
                         </span>
                       </div>
                    </div>
                  ))}
                  {ordens.filter(o => o.talhaoId === talhao.id).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhuma ordem para este talhão</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {replayExec && (
          <ReplayExecucao 
            exec={replayExec} 
            talhao={talhao}
            onClose={() => setReplayExec(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
