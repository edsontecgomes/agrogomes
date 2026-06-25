import { ExecucaoServico } from '../types';
import { calcularDistancia, calcularVelocidade } from './geoUtils';

export interface ReplayEvent {
  id: string;
  type: 'inicio' | 'pausa' | 'retomada' | 'sinal_perdido' | 'final';
  timestamp: number;
  duration?: number; // in seconds
  location?: { lat: number; lng: number };
}

export function gerarTimelineExecucao(exec: ExecucaoServico): ReplayEvent[] {
  const events: ReplayEvent[] = [];
  const path = exec.path || [];

  if (path.length === 0) return events;

  // 1. Início
  events.push({
    id: 'start',
    type: 'inicio',
    timestamp: path[0].timestamp,
    location: { lat: path[0].lat, lng: path[0].lng }
  });

  const PAUSE_THRESHOLD = 30000; // 30 seconds
  const SIGNAL_LOST_THRESHOLD = 60000; // 60 seconds

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const timeDiff = curr.timestamp - prev.timestamp;

    if (timeDiff > SIGNAL_LOST_THRESHOLD) {
      events.push({
        id: `signal-${curr.timestamp}`,
        type: 'sinal_perdido',
        timestamp: prev.timestamp,
        duration: timeDiff / 1000,
        location: { lat: prev.lat, lng: prev.lng }
      });
    } else if (timeDiff > PAUSE_THRESHOLD) {
      const speed = calcularVelocidade(prev.lat, prev.lng, prev.timestamp, curr.lat, curr.lng, curr.timestamp);
      if (speed < 0.5) {
        events.push({
          id: `pause-${curr.timestamp}`,
          type: 'pausa',
          timestamp: prev.timestamp,
          duration: timeDiff / 1000,
          location: { lat: prev.lat, lng: prev.lng }
        });
      }
    }
  }

  // 2. Final
  if (exec.status === 'finalizada' && exec.dataFim) {
    events.push({
      id: 'end',
      type: 'final',
      timestamp: exec.dataFim instanceof Date ? exec.dataFim.getTime() : (typeof exec.dataFim === 'number' ? exec.dataFim : Date.now()),
      location: path[path.length - 1] ? { lat: path[path.length - 1].lat, lng: path[path.length - 1].lng } : undefined
    });
  }

  return events;
}

export function calcularDuracaoExecucao(exec: ExecucaoServico): number {
  if (!exec.path || exec.path.length < 2) return 0;
  const start = exec.path[0].timestamp;
  const end = exec.path[exec.path.length - 1].timestamp;
  return (end - start) / 1000; // in seconds
}
