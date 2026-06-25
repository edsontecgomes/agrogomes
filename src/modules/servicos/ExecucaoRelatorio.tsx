import React, { useMemo, useEffect, useRef, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Activity, 
  Zap, 
  FastForward, 
  Pause,
  ChevronRight,
  ClipboardCheck,
  Map as MapIcon,
  ListOrdered as TimelineIcon,
  ArrowLeft,
  Package
} from 'lucide-react';
import { ExecucaoServico, SegmentoExecucao, OrdemServico, Talhao, ChecklistResposta, ChecklistTemplate } from '../../types';
import { gerarResumoExecucao, formatarDuracao } from '../../utils/reportUtils';
import { gerarTimelineExecucao } from '../../utils/replayUtils';
import { loadGoogleMaps } from '../../services/googleMaps';
import { motion } from 'motion/react';

interface ExecucaoRelatorioProps {
  exec: ExecucaoServico;
  segmentos: SegmentoExecucao[];
  ordem?: OrdemServico;
  talhao?: Talhao;
  checklistResposta?: ChecklistResposta;
  checklistTemplate?: ChecklistTemplate;
  onBack: () => void;
}

export function ExecucaoRelatorio({ 
  exec, 
  segmentos, 
  ordem, 
  talhao, 
  checklistResposta, 
  checklistTemplate,
  onBack 
}: ExecucaoRelatorioProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!exec.path || exec.path.length === 0) return;

    loadGoogleMaps()
      .then((google) => {
        if (!active || !mapContainerRef.current) return;
        const center = { lat: exec.path[0].lat, lng: exec.path[0].lng };

        const gMap = new google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 15,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          zoomControl: false,
        });

        // 1. Full track
        const fullCoords = exec.path?.map(p => ({ lat: p.lat, lng: p.lng })) || [];
        new google.maps.Polyline({
          path: fullCoords,
          geodesic: true,
          strokeColor: '#94a3b8',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          map: gMap,
        });

        // 2. Operational segments
        segmentos.forEach(seg => {
          const segCoords = seg.pontos.map(p => ({ lat: p.lat, lng: p.lng }));
          new google.maps.Polyline({
            path: segCoords,
            geodesic: true,
            strokeColor: '#059669',
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map: gMap,
          });
        });

        // 3. Start point (blue circle) & end point (red circle)
        if (fullCoords.length > 0) {
          // Blue circle for start
          new google.maps.Marker({
            position: fullCoords[0],
            map: gMap,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }
          });

          // Red circle for end
          new google.maps.Marker({
            position: fullCoords[fullCoords.length - 1],
            map: gMap,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#dc2626',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setMapError('Erro ao carregar o Google Maps.');
      });

    return () => {
      active = false;
    };
  }, [exec, segmentos]);
  
  const metricas = useMemo(() => {
    return gerarResumoExecucao(exec, segmentos, ordem?.larguraOperacional || 0);
  }, [exec, segmentos, ordem]);

  const timeline = useMemo(() => {
    return gerarTimelineExecucao(exec);
  }, [exec]);

  if (!exec || !metricas) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Fixo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Relatório Operacional</h1>
              <p className="text-xs text-slate-500 font-medium">Ref: {ordem?.titulo || 'Execução sem OS'}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
            Finalizada
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* Seção 1: Resumo */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
               <User className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Operador</span>
            </div>
            <p className="font-bold text-slate-900">{exec.operadorNome || 'Operador não identificado'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
               <MapPin className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Talhão</span>
            </div>
            <p className="font-bold text-slate-900">{talhao?.nome || 'Talhão não identificado'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
               <Calendar className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Data</span>
            </div>
            <p className="font-bold text-slate-900">
              {exec.dataInicio ? exec.dataInicio.toLocaleDateString() : '-'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-400">
               <Clock className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Duração</span>
            </div>
            <p className="font-bold text-slate-900">{formatarDuracao(metricas.duracaoTotal)}</p>
          </div>

          {exec.maquinaNome && (
            <div className="space-y-2 border-t md:border-t-0 md:border-l md:pl-4 border-slate-100">
              <div className="flex items-center gap-3 text-slate-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Máquina</span>
              </div>
              <p className="font-bold text-slate-900">{exec.maquinaNome}</p>
            </div>
          )}

          {exec.implementoNome && (
            <div className="space-y-2 border-t md:border-t-0 md:border-l md:pl-4 border-slate-100">
              <div className="flex items-center gap-3 text-slate-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Implemento</span>
              </div>
              <p className="font-bold text-slate-900">{exec.implementoNome}</p>
            </div>
          )}
        </motion.section>

        {/* Seção 2: Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center text-center"
          >
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Distância Tot.</p>
             <h4 className="text-3xl font-black text-slate-900">{(metricas.distanciaTotal / 1000).toFixed(2)}<span className="text-sm text-slate-400 ml-1">km</span></h4>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center text-center"
          >
             <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Velocidade Média</p>
             <h4 className="text-3xl font-black text-slate-900">{metricas.velocidadeMedia.toFixed(1)}<span className="text-sm text-slate-400 ml-1">km/h</span></h4>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 }}
             className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center text-center"
          >
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FastForward className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Área Estimada</p>
             <h4 className="text-3xl font-black text-slate-900">{metricas.areaEstimada.toFixed(2)}<span className="text-sm text-slate-400 ml-1">ha</span></h4>
          </motion.div>
        </div>

        {/* Seção Insumos Aplicados */}
        {ordem?.produtos && ordem.produtos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
          >
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                   <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Insumos Aplicados do Estoque</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ordem.produtos.map((p, idx) => {
                  const isAreaBased = ['Plantio', 'Pulverizacao', 'Adubacao'].includes(ordem.tipoOperacao);
                  const area = talhao?.area || 0;
                  const qtyConsumida = isAreaBased && area > 0 ? (p.dose || 0) * area : (p.dose || 0);

                  return (
                    <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                       <div>
                          <p className="font-bold text-slate-800">{p.nome || 'Insumo'}</p>
                          <p className="text-xs text-slate-500 font-medium">Dose recomendada: {p.dose} {p.unidade}/{isAreaBased ? 'ha' : 'un'}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Consumido</p>
                          <p className="text-lg font-black text-rose-600">
                             {qtyConsumida.toFixed(2)} {p.unidade}
                          </p>
                       </div>
                    </div>
                  );
                })}
             </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seção 4: Mapa Resumido */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                       <MapIcon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900">Mapa Resumido</h3>
                 </div>
              </div>
              <div className="h-[400px] relative">
                {mapError ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-rose-500 font-semibold">{mapError}</div>
                ) : (
                  <div ref={mapContainerRef} className="w-full h-full" />
                )}
              </div>
            </motion.div>

            {/* Seção 5: Timeline */}
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                    <TimelineIcon className="w-4 h-4" />
                 </div>
                 <h3 className="font-bold text-slate-900">Timeline da Operação</h3>
              </div>
              
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                 {timeline.map((event, idx) => (
                   <div key={event.id} className="flex gap-6 relative pl-8">
                      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 ${
                        event.type === 'inicio' ? 'bg-blue-600' :
                        event.type === 'final' ? 'bg-rose-600' :
                        event.type === 'pausa' ? 'bg-amber-500' :
                        'bg-slate-400'
                      }`}>
                         {event.type === 'inicio' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                         {event.type === 'final' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                         {event.type === 'pausa' && <Pause className="w-3 h-3 text-white fill-white" />}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <h4 className="text-sm font-bold text-slate-800 capitalize">{event.type.replace('_', ' ')}</h4>
                         </div>
                         {event.duration && (
                           <p className="text-xs text-slate-500 font-medium">Duração: {formatarDuracao(event.duration)}</p>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
         </div>

         {/* Seção 3: Checklist */}
         {checklistResposta && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
          >
             <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                   <ClipboardCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Checklist Pré-Operacional</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklistResposta.respostas.map(resp => {
                  const itemTemplate = checklistTemplate?.itens.find(i => i.id === resp.itemId);
                  if (!itemTemplate) return null;

                  return (
                    <div key={resp.itemId} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-500">{itemTemplate.pergunta}</p>
                          <p className="font-bold text-slate-900">
                            {itemTemplate.tipo === 'boolean' 
                              ? (resp.valor ? 'Sim' : 'Não') 
                              : resp.valor}
                          </p>
                       </div>
                       {itemTemplate.tipo === 'boolean' && (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${resp.valor ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                           <CheckCircle2 className="w-5 h-5" />
                         </div>
                       )}
                    </div>
                  );
                })}
             </div>
          </motion.section>
         )}

         {/* Métricas Adicionais */}
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
         >
            <div className="bg-slate-200/50 p-6 rounded-[24px] text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tempo Operando</p>
               <p className="text-lg font-black text-slate-700">{formatarDuracao(metricas.tempoOperando)}</p>
            </div>
            <div className="bg-slate-200/50 p-6 rounded-[24px] text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tempo Parado</p>
               <p className="text-lg font-black text-slate-700">{formatarDuracao(metricas.tempoParado)}</p>
            </div>
            <div className="bg-slate-200/50 p-6 rounded-[24px] text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Velocidade Máx.</p>
               <p className="text-lg font-black text-slate-700">{metricas.velocidadeMax.toFixed(1)} km/h</p>
            </div>
            <div className="bg-slate-200/50 p-6 rounded-[24px] text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Segmentos</p>
               <p className="text-lg font-black text-slate-700">{metricas.totalSegmentos}</p>
            </div>
         </motion.div>

      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
