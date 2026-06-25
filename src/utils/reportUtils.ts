import { ExecucaoServico, SegmentoExecucao, OrdemServico } from '../types';
import { calcularDistancia, calcularVelocidade } from './geoUtils';

/**
 * Calcula o tempo total em segundos em que a máquina estava operando (em segmentos)
 */
export function calcularTempoOperando(segmentos: SegmentoExecucao[]): number {
  return segmentos.reduce((acc, seg) => acc + (seg.fimTimestamp - seg.inicioTimestamp) / 1000, 0);
}

/**
 * Calcula o tempo total em segundos em que a máquina estava parada ou em pausa
 */
export function calcularTempoParado(exec: ExecucaoServico, tempoOperando: number): number {
  const path = exec.path || [];
  if (path.length < 2) return 0;
  const duracaoTotal = (path[path.length - 1].timestamp - path[0].timestamp) / 1000;
  return Math.max(0, duracaoTotal - tempoOperando);
}

/**
 * Calcula a área estimada coberta em hectares
 */
export function calcularAreaEstimada(segmentos: SegmentoExecucao[], larguraPadrao: number): number {
  let distanciaOperacional = 0;
  segmentos.forEach(seg => {
    for (let i = 1; i < seg.pontos.length; i++) {
       distanciaOperacional += calcularDistancia(
         seg.pontos[i-1].lat, seg.pontos[i-1].lng, 
         seg.pontos[i].lat, seg.pontos[i].lng
       );
    }
  });
  return (distanciaOperacional * larguraPadrao) / 10000;
}

/**
 * Calcula métricas detalhadas de uma execução
 */
export function gerarResumoExecucao(
  exec: ExecucaoServico, 
  segmentos: SegmentoExecucao[], 
  larguraPadrao: number = 0
) {
  const path = exec.path || [];
  if (path.length === 0) return null;

  // 1. Distância Total
  let distanciaTotal = 0;
  let velocidadeMax = 0;
  for (let i = 1; i < path.length; i++) {
    const d = calcularDistancia(path[i-1].lat, path[i-1].lng, path[i].lat, path[i].lng);
    distanciaTotal += d;
    
    const v = calcularVelocidade(
      path[i-1].lat, path[i-1].lng, path[i-1].timestamp,
      path[i].lat, path[i].lng, path[i].timestamp
    );
    if (v > velocidadeMax) velocidadeMax = v;
  }

  // 2. Tempo Operando
  const tempoOperando = calcularTempoOperando(segmentos);
  
  // Distância Operacional
  let distanciaOperacional = 0;
  segmentos.forEach(seg => {
    for (let i = 1; i < seg.pontos.length; i++) {
       distanciaOperacional += calcularDistancia(
         seg.pontos[i-1].lat, seg.pontos[i-1].lng, 
         seg.pontos[i].lat, seg.pontos[i].lng
       );
    }
  });

  // 3. Tempo Total e Parado
  const inicio = path[0].timestamp;
  const fim = path[path.length - 1].timestamp;
  const duracaoTotal = (fim - inicio) / 1000;
  const tempoParado = calcularTempoParado(exec, tempoOperando);

  // 4. Velocidade Média
  const velocidadeMedia = tempoOperando > 0 
    ? (distanciaOperacional / tempoOperando) * 3.6 // km/h
    : (distanciaTotal / duracaoTotal) * 3.6;

  // 5. Área Estimada Coberta
  const areaHectares = calcularAreaEstimada(segmentos, larguraPadrao);

  return {
    distanciaTotal, // metros
    distanciaOperacional, // metros
    velocidadeMedia, // km/h
    velocidadeMax: velocidadeMax * 3.6, // km/h
    tempoOperando, // segundos
    tempoParado, // segundos
    duracaoTotal, // segundos
    areaEstimada: areaHectares, // hectares
    totalSegmentos: segmentos.length
  };
}

export function formatarDuracao(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}
