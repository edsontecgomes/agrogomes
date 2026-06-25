import { useState, useEffect, useRef, useCallback } from 'react';
import { HealthStatus, NotificacaoOperacional } from '../types';
import { syncService } from '../services/syncService';
import { enviarNotificacao } from './useNotificacoes';
import { useMinhasExecucoesAtivas } from './useServicos';

const HEALTH_LOG_KEY = 'agri_health_logs';
const MAX_LOGS = 50;

export function useHealthMonitor(farmId: string | null) {
  const { execucoesAtivas } = useMinhasExecucoesAtivas(farmId);
  const activeExec = execucoesAtivas.find(e => e.status === 'em_execucao');

  const [health, setHealth] = useState<HealthStatus>({
    gps: 'offline',
    internet: navigator.onLine ? 'online' : 'offline',
    sync: 'idle',
    tracking: 'inactive',
    queueSize: syncService.getPendingCount(),
    errors: [],
  });

  const logsRef = useRef<any[]>([]);
  const lastInternetStatus = useRef<string>(navigator.onLine ? 'online' : 'offline');
  const lastGpsAt = useRef<number>(0);
  const lastTrackingAt = useRef<number>(0);

  const addLog = useCallback((event: string, details: any) => {
    const log = {
      timestamp: Date.now(),
      event,
      details
    };
    logsRef.current = [log, ...logsRef.current].slice(0, MAX_LOGS);
    localStorage.setItem(HEALTH_LOG_KEY, JSON.stringify(logsRef.current));
  }, []);

  useEffect(() => {
    // 1. Internet Monitoring
    const handleOnline = () => {
      setHealth(prev => ({ ...prev, internet: 'online' }));
      if (lastInternetStatus.current === 'offline') {
        addLog('CONEXAO_RESTABELECIDA', { time: new Date().toISOString() });
      }
      lastInternetStatus.current = 'online';
    };
    const handleOffline = () => {
      setHealth(prev => ({ ...prev, internet: 'offline' }));
      if (lastInternetStatus.current === 'online') {
        addLog('CONEXAO_PERDIDA', { time: new Date().toISOString() });
        if (farmId) {
          enviarNotificacao({
            farmId,
            tipo: 'OFFLINE',
            titulo: 'Dispositivo Offline',
            mensagem: 'O aplicativo está operando em modo offline. Os dados serão sincronizados quando a conexão voltar.',
            severidade: 'warning'
          });
        }
      }
      lastInternetStatus.current = 'offline';
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Sync Monitoring
    const unsubscribeSync = syncService.subscribe((status) => {
      setHealth(prev => ({
        ...prev,
        sync: status.pending > 0 ? (navigator.onLine ? 'syncing' : 'pending') : 'idle',
        queueSize: status.pending,
        lastSyncAt: status.pending === 0 && prev.queueSize > 0 ? new Date() : prev.lastSyncAt
      }));
    });

    // 3. GPS Monitoring (Passive check from window/navigator)
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const accuracy = pos.coords.accuracy;
          const status = accuracy <= 30 ? 'ok' : 'weak';
          
          setHealth(prev => {
            const gpsTransitionedToWeak = prev.gps === 'ok' && status === 'weak';
            if (gpsTransitionedToWeak && farmId) {
              enviarNotificacao({
                farmId,
                tipo: 'GPS_FRACO',
                titulo: 'GPS com Baixa Precisão',
                mensagem: `A precisão do GPS está em ${Math.round(accuracy)}m. Tente se mover para uma área aberta.`,
                severidade: 'warning'
              });
            }
            return {
              ...prev,
              gps: status,
              lastGpsAt: new Date()
            };
          });
          lastGpsAt.current = Date.now();
        },
        (err) => {
          setHealth(prev => ({ ...prev, gps: 'offline' }));
          addLog('GPS_ERROR', { code: err.code, message: err.message });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    // 4. Battery Monitoring
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          let status: HealthStatus['battery'] = 'normal';
          if (battery.level <= 0.1) status = 'critical';
          else if (battery.level <= 0.2) status = 'low';
          
          setHealth(prev => ({ ...prev, battery: status }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
      });
    }

    // 5. Periodic Anomaly Detection
    const checkInterval = setInterval(() => {
      const now = Date.now();
      
      // Check GPS Staleness
      if (lastGpsAt.current && now - lastGpsAt.current > 120000) { // 2 minutes
        setHealth(prev => ({ ...prev, gps: 'offline' }));
      }

      // Check Tracking Staleness
      if (activeExec) {
        if (activeExec.path && activeExec.path.length > 0) {
          const lastPoint = activeExec.path[activeExec.path.length - 1];
          if (now - lastPoint.timestamp > 300000) { // 5 minutes without points
             setHealth(prev => ({ ...prev, tracking: 'error' }));
             if (farmId) {
                enviarNotificacao({
                  farmId,
                  tipo: 'EXECUCAO_PARADA',
                  titulo: 'Execução Sem Movimento',
                  mensagem: 'A execução está ativa mas não detectamos movimento há 5 minutos.',
                  severidade: 'critical'
                });
             }
          } else {
            setHealth(prev => ({ ...prev, tracking: 'active' }));
          }
        } else {
          // Just started or no points yet
          setHealth(prev => ({ ...prev, tracking: 'active' }));
        }
      } else {
        setHealth(prev => ({ ...prev, tracking: 'inactive' }));
      }

    }, 30000); // Check every 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      clearInterval(checkInterval);
    };
  }, [farmId, activeExec, addLog]);

  return { health, logs: logsRef.current };
}
