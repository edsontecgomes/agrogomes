import { 
  ExecucaoServico, 
  SegmentoExecucao, 
  ChuvaComunitaria, 
  OrdemServico 
} from '../types';
import { isPointInPolygon } from './geoUtils';

export interface TalhaoEvent {
  id: string;
  type: 'chuva' | 'execucao_inicio' | 'execucao_fim' | 'pausa' | 'retomada' | 'alerta';
  timestamp: number;
  operadorNome?: string;
  descricao: string;
  valor?: number; // mm for rain
  unidade?: string;
  data?: any;
}

export function gerarEventosTalhao(
  talhaoId: string,
  execucoes: ExecucaoServico[],
  chuvas: ChuvaComunitaria[],
  talhaoGeometria: any
): TalhaoEvent[] {
  const events: TalhaoEvent[] = [];

  // Filter executions for this talhão
  const filteredExecs = execucoes.filter(e => e.talhaoId === talhaoId);
  
  filteredExecs.forEach(exec => {
    if (exec.dataInicio) {
      events.push({
        id: `start-${exec.id}`,
        type: 'execucao_inicio',
        timestamp: exec.dataInicio instanceof Date ? exec.dataInicio.getTime() : (exec.dataInicio as any).toMillis(),
        operadorNome: exec.operadorNome,
        descricao: `Início de execução: ${exec.status}`,
        data: exec
      });
    }

    if (exec.status === 'finalizada' && exec.dataFim) {
      events.push({
        id: `end-${exec.id}`,
        type: 'execucao_fim',
        timestamp: exec.dataFim instanceof Date ? exec.dataFim.getTime() : (exec.dataFim as any).toMillis(),
        operadorNome: exec.operadorNome,
        descricao: 'Execução finalizada',
        data: exec
      });
    }
  });

  // Filter rains that are inside the talhão or associated with it
  // For now, simpler: check if point in polygon if geometry exists
  chuvas.forEach(chuva => {
    let inside = false;
    if (talhaoGeometria && talhaoGeometria.coordinates) {
      inside = isPointInPolygon(chuva.location.lat, chuva.location.lng, talhaoGeometria.coordinates[0]);
    }
    
    // If we don't have talhaoId in ChuvaComunitaria, we use spatial check
    // Or if the user previously added talhaoId to rain (it's not in types but might be in data)
    if (inside || (chuva as any).talhaoId === talhaoId) {
      events.push({
        id: `chuva-${chuva.id}`,
        type: 'chuva',
        timestamp: chuva.timestamp instanceof Date ? chuva.timestamp.getTime() : (chuva.timestamp as any).toMillis(),
        descricao: `Registro de chuva: ${chuva.mm}mm`,
        valor: chuva.mm,
        unidade: 'mm',
        data: chuva
      });
    }
  });

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export function calcularChuvaAcumulada(chuvas: ChuvaComunitaria[], period: 'week' | 'month' = 'month'): number {
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const threshold = period === 'week' ? 7 * msPerDay : 30 * msPerDay;

  return chuvas
    .filter(c => {
      const ts = c.timestamp instanceof Date ? c.timestamp.getTime() : (c.timestamp as any).toMillis();
      return (now - ts) <= threshold;
    })
    .reduce((acc, c) => acc + c.mm, 0);
}

export function gerarResumoTalhao(
  talhaoId: string,
  execucoes: ExecucaoServico[],
  segmentos: SegmentoExecucao[],
  chuvas: ChuvaComunitaria[]
) {
  const talhaoExecs = execucoes.filter(e => e.talhaoId === talhaoId);
  const talhaoSegments = segmentos.filter(s => s.talhaoId === talhaoId);
  
  const totalDist = talhaoSegments.reduce((acc, s) => acc + (s.metadata?.distanciaPercorrida || 0), 0);
  const totalHectares = talhaoSegments.reduce((acc, s) => {
    const width = s.larguraOperacional || 0;
    const dist = s.metadata?.distanciaPercorrida || 0;
    return acc + (width * dist) / 10000;
  }, 0);

  const operators = new Set(talhaoExecs.map(e => e.operadorNome).filter(Boolean));

  return {
    totalOperations: talhaoExecs.length,
    totalDistKm: totalDist / 1000,
    totalHectares,
    operatorCount: operators.size,
    lastActivity: talhaoExecs[0]?.dataInicio
  };
}
