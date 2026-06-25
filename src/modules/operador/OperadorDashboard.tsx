import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  StopCircle, 
  MapPin, 
  Clock, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Zap,
  ChevronRight,
  TrendingUp,
  Signal,
  Wifi,
  WifiOff,
  Navigation,
  Thermometer,
  Droplets,
  Bell,
  Map,
  Layers,
  ClipboardList
} from 'lucide-react';
import { syncService } from '../../services/syncService';
import { enviarNotificacao, useNotificacoes } from '../../hooks/useNotificacoes';
import { useMinhasExecucoesAtivas, useOrdensServico, useTodasExecucoesServico } from '../../hooks/useServicos';
import { useTalhoes } from '../../hooks/useTalhoes';
import { useChuvasComunitarias } from '../../hooks/useChuvasComunitarias';
import { usePluviometros } from '../../hooks/usePluviometros';
import { ExecucaoServico, OrdemServico, Talhao, Usuario } from '../../types';
import { CentralOperacional } from '../servicos/CentralOperacional';
import { calcularDistancia } from '../../utils/geoUtils';
import { formatarDuracao } from '../../utils/reportUtils';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../../services/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../utils/errorHandling';
import { ChuvaForm } from '../chuva/ChuvaForm';
import { ChecklistRunner } from '../servicos/ChecklistRunner';
import { NotificationCenter } from './NotificationCenter';

import { useFarm } from '../../contexts/FarmContext';

interface OperadorDashboardProps {
  farmId: string;
  usuario?: Usuario;
}

export function OperadorDashboard({ farmId, usuario }: OperadorDashboardProps) {
  const { activeFarm } = useFarm();
  const { execucoesAtivas, loading: loadingActive } = useMinhasExecucoesAtivas(farmId);
  const { ordens, loading: loadingOrdens, atualizarStatusOS } = useOrdensServico(farmId);
  const { execucoes: todasExecucoes, loading: loadingHistory } = useTodasExecucoesServico(farmId);
  const { notificacoes, unreadCount } = useNotificacoes(farmId);
  const currentFarmId = farmId;
  const { talhoes } = useTalhoes(currentFarmId);
  const hasTalhoes = talhoes.length > 0;

  console.log('Talhões encontrados:', talhoes.length);
  console.log('Farm ativa:', currentFarmId);
  console.log('Talhões:', talhoes);

  const { chuvasComunitarias } = useChuvasComunitarias(farmId);
  const { pluviometros } = usePluviometros(farmId);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [showRainForm, setShowRainForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [checklistOrdem, setChecklistOrdem] = useState<OrdemServico | null>(null);
  
  // Define default tab based on user role (defaulting to 'central' for managers/admins, and 'operacoes' for operators)
  const isOperator = usuario?.role === 'operador';
  const [subTab, setSubTab] = useState<'operacoes' | 'central'>(isOperator ? 'operacoes' : 'central');

  // Monitor Location & Online Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      enviarNotificacao({
        farmId,
        tipo: 'SINCRONIZADO',
        titulo: 'Conexão Restaurada',
        mensagem: 'O dispositivo está online e sincronizando dados.',
        severidade: 'info'
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      enviarNotificacao({
        farmId,
        tipo: 'OFFLINE',
        titulo: 'Modo Offline',
        mensagem: 'Você está trabalhando sem internet. Os dados serão salvos localmente.',
        severidade: 'warning'
      });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribeSync = syncService.subscribe(status => {
      if (pendingSync > 0 && status.pending === 0) {
         enviarNotificacao({
           farmId,
           tipo: 'SINCRONIZADO',
           titulo: 'Sincronização Concluída',
           mensagem: 'Todos os seus registros foram enviados com sucesso.',
           severidade: 'info'
         });
      }
      setPendingSync(status.pending);
    });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsAccuracy(pos.coords.accuracy);

        if (pos.coords.accuracy > 30) {
          // Debounce this in a real app
          enviarNotificacao({
            farmId,
            tipo: 'GPS_FRACO',
            titulo: 'Sinal GPS Fraco',
            mensagem: 'A precisão do GPS está baixa. Tente se posicionar melhor.',
            severidade: 'warning'
          });
        }
      },
      (err) => console.warn('GPS Error', err),
      { enableHighAccuracy: true }
    );

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
      navigator.geolocation.clearWatch(watchId);
    };
  }, [farmId, pendingSync]);

  // Filter Next Orders
  const nextOrders = useMemo(() => {
    return ordens
      .filter(o => o.status !== 'finalizada')
      .sort((a, b) => {
        // Priority logic (could be improved)
        if (a.status === 'em_execucao' && b.status !== 'em_execucao') return -1;
        if (b.status === 'em_execucao' && a.status !== 'em_execucao') return 1;
        
        // Priority field if it existed, otherwise by date
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }, [ordens]);

  // Daily Summary (Total for this operator today)
  const dailyMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const myTodayExecs = todasExecucoes.filter(e => 
      e.operadorId === auth.currentUser?.uid && 
      e.createdAt >= today
    );

    const concluídas = myTodayExecs.filter(e => e.status === 'finalizada').length;
    
    let tempoTotal = 0;
    let distanciaTotal = 0;

    myTodayExecs.forEach(e => {
        if (e.dataInicio && e.dataFim) {
            tempoTotal += (e.dataFim.getTime() - e.dataInicio.getTime()) / 1000;
        }
        if (e.path && e.path.length > 1) {
            for (let i = 1; i < e.path.length; i++) {
                distanciaTotal += calcularDistancia(e.path[i-1].lat, e.path[i-1].lng, e.path[i].lat, e.path[i].lng);
            }
        }
    });

    return { concluídas, tempoTotal, distanciaTotal };
  }, [todasExecucoes]);

  const activeExec = execucoesAtivas[0];

  const handleStartExec = async (ordem: OrdemServico) => {
    try {
        await addDoc(collection(db, 'execucoes_servico'), {
          ordemId: ordem.id,
          farmId,
          talhaoId: ordem.talhaoId,
          operadorId: auth.currentUser?.uid,
          operadorNome: auth.currentUser?.displayName || 'Operador',
          status: 'em_execucao',
          origemStart: 'manual',
          locationStart: currentLocation ? { ...currentLocation, accuracy: gpsAccuracy || 0 } : null,
          dataInicio: serverTimestamp(),
          createdAt: serverTimestamp(),
          path: []
        });

        if (ordem.status === 'pendente') {
          await updateDoc(doc(db, 'ordens_servico', ordem.id), { status: 'em_execucao' });
        }

        enviarNotificacao({
          farmId,
          tipo: 'CHECKLIST_PENDENTE',
          titulo: 'Checklist Requerido',
          mensagem: `A operação de ${ordem.tipoOperacao} requer a conclusão de um checklist de segurança.`,
          severidade: 'info'
        });

        enviarNotificacao({
          farmId,
          tipo: 'OS_INICIADA',
          titulo: 'Operação Iniciada',
          mensagem: `A operação de ${ordem.tipoOperacao} no talhão ${talhoes.find(t => t.id === ordem.talhaoId)?.nome || ''} foi iniciada.`,
          severidade: 'info'
        });

        setChecklistOrdem(null);
    } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'execucoes_servico');
    }
  };

  const handlePauseExec = async (execId: string) => {
    try {
        await updateDoc(doc(db, 'execucoes_servico', execId), {
            status: 'pausada',
            updatedAt: serverTimestamp()
        });
        enviarNotificacao({
          farmId,
          tipo: 'EXECUCAO_PAUSADA',
          titulo: 'Execução Pausada',
          mensagem: 'A operação atual foi colocada em espera.',
          severidade: 'warning'
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `execucoes_servico/${execId}`);
    }
  };

  const handleResumeExec = async (execId: string) => {
    try {
        await updateDoc(doc(db, 'execucoes_servico', execId), {
            status: 'em_execucao',
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `execucoes_servico/${execId}`);
    }
  };

  const handleFinishExec = async (execId: string, ordemId: string) => {
    try {
        await updateDoc(doc(db, 'execucoes_servico', execId), {
            status: 'finalizada',
            dataFim: serverTimestamp(),
            locationEnd: currentLocation ? { ...currentLocation, accuracy: gpsAccuracy || 0 } : null,
            updatedAt: serverTimestamp()
        });

        await updateDoc(doc(db, 'ordens_servico', ordemId), { status: 'parcial' });

        enviarNotificacao({
          farmId,
          tipo: 'OS_FINALIZADA',
          titulo: 'Execução Finalizada',
          mensagem: 'A jornada operacional foi concluída e salva.',
          severidade: 'info'
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `execucoes_servico/${execId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-2 space-y-6">
      
      {/* Selector de Abas do Painel */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto mb-6 shadow-sm border border-slate-200/50">
        <button
          onClick={() => setSubTab('operacoes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subTab === 'operacoes'
              ? 'bg-white text-slate-900 shadow-sm font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Minhas Operações
        </button>
        <button
          onClick={() => setSubTab('central')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            subTab === 'central'
              ? 'bg-white text-slate-900 shadow-sm font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Central de Telemetria
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'operacoes' ? (
          <motion.div
            key="operacoes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-md mx-auto space-y-6"
          >
            {/* Alertas Rápidos */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              <button 
                onClick={() => setShowNotifications(true)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold border border-slate-800 relative"
              >
                <Bell className="w-3.5 h-3.5" /> 
                Notificações
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {!isOnline && (
                 <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
                   <WifiOff className="w-3.5 h-3.5" /> Offline
                 </div>
              )}
            </div>

            {/* Resumo ou Lembrete de Talhões */}
            {!hasTalhoes ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-50 border border-amber-200 rounded-[24px] p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MapPin className="w-12 h-12 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-amber-900 mb-1">Mapeamento Pendente</h4>
                <p className="text-xs text-amber-700 leading-relaxed max-w-[80%]">
                  Você ainda não cadastrou seus talhões. Cadastre agora para desbloquear mapas e rastreabilidade premium.
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    console.log('Abrindo cadastro de talhão');
                    const event = new CustomEvent('set-active-module', { detail: 'talhoes' });
                    window.dispatchEvent(event);
                  }}
                  style={{ cursor: 'pointer' }}
                  className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-200 transition-colors pointer-events-auto relative z-10"
                >
                  Cadastrar Primeiro Talhão
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-left">
                {/* Card: Talhões Cadastrados */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-600">
                    <Map className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">📍 Talhões</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">{talhoes.length}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Cadastrados e ativos</span>
                </div>

                {/* Card: Área Total Mapeada */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-600">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">📐 Área Mapeada</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {talhoes.reduce((acc, t) => acc + (t.area || t.areaHa || 0), 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-slate-450">ha</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Hectares totais</span>
                </div>

                {/* Card: Pluviômetros Ativos */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-600">
                    <CloudRain className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">🌧️ Pluviômetros</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">{pluviometros?.length || 0}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Sensores instalados</span>
                </div>

                {/* Card: Ordens em Execução */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-600">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">🚜 OS Ativas</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {ordens ? ordens.filter(o => o.status === 'em_execucao').length : 0}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Ordens em execução</span>
                </div>
              </div>
            )}

            {/* Execução Ativa */}
            <AnimatePresence mode="wait">
              {activeExec ? (
                <motion.div 
                  key="active"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-slate-200 border border-white/10 relative overflow-hidden"
                >
                   {/* Glow Effect */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                   
                   <div className="relative z-10 space-y-6">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                             <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                             Operação em Andamento
                          </span>
                          <h2 className="text-xl font-bold text-white leading-tight">
                             {ordens.find(o => o.id === activeExec.ordemId)?.titulo || 'Operação'}
                          </h2>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                           <Navigation className="w-5 h-5 text-white animate-bounce" />
                        </div>
                     </div>

                     <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                           <MapPin className="w-4 h-4" />
                           {talhoes.find(t => t.id === activeExec.talhaoId)?.nome || 'Talhão'}
                        </div>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <div className="flex items-center gap-1.5">
                           <Clock className="w-4 h-4" />
                           <ActiveTimer start={activeExec.dataInicio} />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        {activeExec.status === 'em_execucao' ? (
                          <button 
                            onClick={() => handlePauseExec(activeExec.id)}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all active:scale-95"
                          >
                             <Pause className="w-5 h-5" /> Pausar
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleResumeExec(activeExec.id)}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all active:scale-95"
                          >
                             <Play className="w-5 h-5" /> Retomar
                          </button>
                        )}
                        <button 
                          onClick={() => handleFinishExec(activeExec.id, activeExec.ordemId)}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all active:scale-95"
                        >
                           <StopCircle className="w-5 h-5" /> Finalizar
                        </button>
                     </div>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="empty"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="bg-white rounded-[32px] p-8 text-center border-2 border-dashed border-slate-200"
                >
                   <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8" />
                   </div>
                   <p className="text-slate-900 font-bold">Nenhuma execução ativa agora.</p>
                   <p className="text-sm text-slate-500 mt-1">Selecione uma ordem de serviço abaixo para começar.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Próximas Ordens */}
            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Próximas Tarefas</h3>
                <span className="text-[10px] font-bold text-slate-400">{nextOrders.length} OS Disponíveis</span>
              </div>

              <div className="space-y-3">
                 {nextOrders.length === 0 ? (
                   <div className="p-6 bg-slate-50 rounded-2xl text-center text-sm text-slate-500">
                      Tudo em dia! Nenhuma OS pendente.
                   </div>
                 ) : (
                   nextOrders.slice(0, 3).map(ordem => (
                     <div 
                       key={ordem.id}
                       className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex items-center justify-between group active:bg-slate-50 transition-colors"
                     >
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ordem.tipoOperacao}</span>
                           <h4 className="font-bold text-slate-900">{ordem.titulo}</h4>
                           <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="w-3 h-3" />
                              {talhoes.find(t => t.id === ordem.talhaoId)?.nome || 'Talhão'}
                              {currentLocation && talhoes.find(t => t.id === ordem.talhaoId) && (
                                <>
                                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                  <span>
                                    {(calcularDistancia(
                                      currentLocation.lat, currentLocation.lng,
                                      talhoes.find(t => t.id === ordem.talhaoId)!.geometria?.centroid?.[1] || 0,
                                      talhoes.find(t => t.id === ordem.talhaoId)!.geometria?.centroid?.[0] || 0
                                    ) / 1000).toFixed(1)} km
                                  </span>
                                </>
                              )}
                           </div>
                        </div>
                        <button 
                          onClick={() => setChecklistOrdem(ordem)}
                          className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        >
                           <Play className="w-5 h-5 fill-white" />
                        </button>
                     </div>
                   ))
                 )}
              </div>
            </section>

            {/* Chuva Rápida & Resumo do Dia */}
            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={() => setShowRainForm(true)}
                 className="bg-blue-600 p-6 rounded-[32px] text-left space-y-4 shadow-lg shadow-blue-200 transition-all active:scale-95"
               >
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                     <CloudRain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Registrar</p>
                     <h4 className="text-lg font-bold text-white">Chuva</h4>
                  </div>
               </button>

               <div className="bg-emerald-600 p-6 rounded-[32px] text-left space-y-4 shadow-lg shadow-emerald-200">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                     <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Resumo Dia</p>
                     <h4 className="text-lg font-bold text-white">{dailyMetrics.concluídas} <span className="text-sm font-medium opacity-60">Tarefas</span></h4>
                  </div>
               </div>
            </div>

            {/* Métricas do Dia (Expandidas) */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desempenho Hoje</h4>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <p className="text-xs text-slate-500 font-medium">Distância</p>
                     <p className="text-lg font-black text-slate-900">{(dailyMetrics.distanciaTotal / 1000).toFixed(1)} <span className="text-xs text-slate-400 font-bold uppercase">km</span></p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs text-slate-500 font-medium">Tempo Trab.</p>
                     <p className="text-lg font-black text-slate-900">{formatarDuracao(dailyMetrics.tempoTotal)}</p>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="central"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <CentralOperacional farmId={farmId} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modais outside subTab */}
      {showRainForm && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
           <motion.div 
             initial={{ y: "100%" }}
             animate={{ y: 0 }}
             className="w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 max-h-[90vh] overflow-y-auto"
           >
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black text-slate-900">Registrar Chuva</h3>
                 <button onClick={() => setShowRainForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <Zap className="w-5 h-5 text-slate-400 rotate-45" />
                 </button>
              </div>
              <ChuvaForm 
                pluviometros={pluviometros} 
                farmId={farmId} 
                onSuccess={() => setShowRainForm(false)}
              />
           </motion.div>
        </div>
      )}

      {checklistOrdem && (
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
           <div className="max-w-md mx-auto min-h-screen flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h1 className="text-xl font-bold text-slate-900">Checklist Obrigatório</h1>
                 <button onClick={() => setChecklistOrdem(null)} className="text-slate-400 hover:text-slate-600">Fechar</button>
              </div>
              <div className="flex-grow p-6">
                 <ChecklistRunner 
                   farmId={farmId}
                   tipoOperacao={checklistOrdem.tipoOperacao}
                   ordemId={checklistOrdem.id}
                   operadorId={auth.currentUser?.uid || ''}
                   onComplete={() => handleStartExec(checklistOrdem)}
                   onCancel={() => setChecklistOrdem(null)}
                 />
              </div>
           </div>
        </div>
      )}

      {/* Notification Center */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationCenter 
            farmId={farmId} 
            onClose={() => setShowNotifications(false)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

function ActiveTimer({ start }: { start?: Date }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!start) return <span>00:00:00</span>;

  const seconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  return <span>{formatarDuracao(seconds)}</span>;
}
