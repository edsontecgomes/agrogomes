import { useEffect, useRef } from 'react';
import { doc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { syncService } from '../services/syncService';
import { enviarNotificacao } from '../hooks/useNotificacoes';
import { ExecucaoServico, SegmentoExecucao } from '../types';
import { validarPontoGPS, calcularDistancia, calcularVelocidade } from '../utils/geoUtils';

interface LocationTrackerProps {
  activeExecutions: ExecucaoServico[];
}

export function LocationTracker({ activeExecutions }: LocationTrackerProps) {
  const pointsBuffer = useRef<{ [execId: string]: any[] }>({});
  const currentSegments = useRef<{ [execId: string]: Partial<SegmentoExecucao> }>({});
  const lastUpdateRef = useRef<{ [execId: string]: number }>({});
  const lastNotificationRef = useRef<{ [key: string]: number }>({});
  const larguraOperacionalRef = useRef<{ [ordemId: string]: number }>({});

  // Memoize largura operacional from orders
  useEffect(() => {
    activeExecutions.forEach(async (exec) => {
      // Skip fetching if already in ref or if execId is offline (temporary)
      if (exec.id.startsWith('offline_')) return;
      
      if (!larguraOperacionalRef.current[exec.ordemId]) {
        try {
          const osSnap = await getDoc(doc(db, 'ordens_servico', exec.ordemId));
          if (osSnap.exists()) {
            larguraOperacionalRef.current[exec.ordemId] = osSnap.data().larguraOperacional || 0;
          }
        } catch (e) {
          console.error('Error fetching OS for largura:', e);
        }
      }
    });
  }, [activeExecutions]);

  useEffect(() => {
    if (activeExecutions.length === 0) return;

    const finalizeSegment = async (execId: string) => {
      const segment = currentSegments.current[execId];
      if (segment && segment.pontos && segment.pontos.length >= 2) {
        try {
          // Calculate distance and average speed for metadata
          let totalDist = 0;
          for (let i = 1; i < segment.pontos.length; i++) {
            totalDist += calcularDistancia(
              segment.pontos[i - 1].lat,
              segment.pontos[i - 1].lng,
              segment.pontos[i].lat,
              segment.pontos[i].lng
            );
          }

          const durationSec = (segment.fimTimestamp! - segment.inicioTimestamp!) / 1000;
          const avgSpeed = durationSec > 0 ? (totalDist / durationSec) * 3.6 : 0;

          const segmentData = {
            ...segment,
            metadata: {
              distanciaPercorrida: totalDist,
              velocidadeMedia: avgSpeed
            }
          };

          if (!navigator.onLine || execId.startsWith('offline_')) {
            syncService.enqueue('CREATE_SEGMENTO', segmentData);
          } else {
            await addDoc(collection(db, 'segmentos_execucao'), {
              ...segmentData,
              createdAt: serverTimestamp()
            });
          }
        } catch (e) {
          console.error('Error saving segment:', e);
        }
      }
      delete currentSegments.current[execId];
    };

    const flushBuffer = async () => {
      for (const execId of Object.keys(pointsBuffer.current)) {
        const points = pointsBuffer.current[execId];
        if (points && points.length > 0) {
          try {
            if (!navigator.onLine || execId.startsWith('offline_')) {
              syncService.enqueue('ADD_PATH_POINT', { execId, points });
            } else {
              await updateDoc(doc(db, 'execucoes_servico', execId), {
                path: arrayUnion(...points)
              });
            }
            pointsBuffer.current[execId] = [];
            lastUpdateRef.current[execId] = Date.now();
          } catch (e) {
            console.error('Error flushing path buffer:', e);
          }
        }
      }
    };

    const interval = setInterval(flushBuffer, 15000);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;
        
        const novoPonto = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          timestamp: Date.now()
        };

        activeExecutions.forEach(async (exec) => {
          const segment = currentSegments.current[exec.id];

          // 1. GPS Accuracy Check
          if (accuracy > 30) {
            const lastGpsNotif = lastNotificationRef.current[`gps_${exec.id}`] || 0;
            const now = Date.now();
            if (now - lastGpsNotif > 600000) { // 10 minutes debounce
              enviarNotificacao({
                farmId: exec.farmId,
                tipo: 'GPS_FRACO',
                titulo: 'Sinal GPS Impreciso',
                mensagem: `A precisão do GPS está em ${Math.round(accuracy)}m. Recomenda-se verificar o posicionamento da antena/celular.`,
                severidade: 'warning'
              });
              lastNotificationRef.current[`gps_${exec.id}`] = now;
            }
          }

          // 0. Handle Pause
          if (exec.status !== 'em_execucao') {
            if (segment) {
              await finalizeSegment(exec.id);
            }
            return;
          }

          const buffer = pointsBuffer.current[exec.id] || [];
          
          const lastPoint = segment?.pontos?.[segment.pontos.length - 1] || 
                           buffer[buffer.length - 1] || 
                           (exec.path && exec.path.length > 0 ? exec.path[exec.path.length - 1] : null);

          // 1. Validate point using geoUtils
          if (!validarPontoGPS(novoPonto, lastPoint || undefined)) {
            return;
          }

          const speed = lastPoint ? calcularVelocidade(
            lastPoint.lat, lastPoint.lng, lastPoint.timestamp,
            novoPonto.lat, novoPonto.lng, novoPonto.timestamp
          ) : 10; // Default if no last point

          // 2. Manage Segments
          const isStop = speed < 0.5;
          const lastPointTime = lastPoint?.timestamp || 0;
          const timeSinceLast = novoPonto.timestamp - lastPointTime;
          const isSignalLost = lastPoint && timeSinceLast > 30000; // 30s gap

          if (isStop || isSignalLost) {
            if (segment) {
              await finalizeSegment(exec.id);
            }

            // Stalled Alert
            const now = Date.now();
            const lastPointTime = lastPoint?.timestamp || exec.dataInicio?.getTime() || now;
            const timeSinceLast = now - lastPointTime;

            if (timeSinceLast > 300000) { // 5 minutes stopped
               const lastStopNotif = lastNotificationRef.current[`stop_${exec.id}`] || 0;
               if (now - lastStopNotif > 900000) { // 15 min debounce
                 enviarNotificacao({
                   farmId: exec.farmId,
                   tipo: 'EXECUCAO_PARADA',
                   titulo: 'Máquina Parada',
                   mensagem: 'A operação está ativa mas não detectamos movimento há mais de 5 minutos.',
                   severidade: 'warning'
                 });
                 lastNotificationRef.current[`stop_${exec.id}`] = now;
               }
            }

            return; // Don't add stopped points to operational segments
          }

          // Start or continue segment
          if (!segment) {
            currentSegments.current[exec.id] = {
              execucaoId: exec.id,
              farmId: exec.farmId,
              ordemId: exec.ordemId,
              operadorId: exec.operadorId,
              talhaoId: exec.talhaoId,
              inicioTimestamp: novoPonto.timestamp,
              fimTimestamp: novoPonto.timestamp,
              larguraOperacional: larguraOperacionalRef.current[exec.ordemId] || 0,
              pontos: [novoPonto]
            };
          } else {
            segment.pontos!.push(novoPonto);
            segment.fimTimestamp = novoPonto.timestamp;
          }

          // 3. Add to path buffer for total track visualization
          if (!pointsBuffer.current[exec.id]) {
            pointsBuffer.current[exec.id] = [];
          }
          pointsBuffer.current[exec.id].push(novoPonto);
        });
      },
      (error) => console.warn('Location tracking error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => {
      clearInterval(interval);
      navigator.geolocation.clearWatch(watchId);
      // Finalize any active segments on unmount
      Object.keys(currentSegments.current).forEach(execId => {
        finalizeSegment(execId);
      });
    };
  }, [activeExecutions]);

  return null;
}
