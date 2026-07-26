import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

export const GPS_PRECISAO_MAXIMA_METROS = 20;
export const GPS_VELOCIDADE_MAXIMA_OPERACIONAL_KMH = 50;
export const GPS_INTERVALO_MINIMO_MS = 500;

export interface PontoGPS {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

export type MotivoRejeicaoGPS =
  | 'coordenada_invalida'
  | 'precisao_insuficiente'
  | 'intervalo_invalido'
  | 'velocidade_incompativel';

export interface AvaliacaoPontoGPS {
  valido: boolean;
  emMovimento: boolean;
  distanciaMetros: number;
  velocidadeKmH: number;
  limiarMovimentoMetros: number;
  motivo?: MotivoRejeicaoGPS;
}

/**
 * Verifica se um ponto está dentro de um polígono GeoJSON.
 */
export function isPointInPolygon(
  lat: number,
  lng: number,
  coordinates: number[][]
): boolean {
  try {
    const pt = point([lng, lat]);
    const poly = polygon([coordinates]);

    return booleanPointInPolygon(pt, poly);
  } catch (error) {
    console.error('Erro ao verificar ponto no polígono:', error);
    return false;
  }
}

/**
 * Calcula a distância entre dois pontos pela fórmula de Haversine.
 *
 * @returns Distância em metros.
 */
export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const raioTerraMetros = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return raioTerraMetros * c;
}

/**
 * Calcula a velocidade entre dois pontos.
 *
 * @returns Velocidade em km/h.
 */
export function calcularVelocidade(
  lat1: number,
  lon1: number,
  t1: number,
  lat2: number,
  lon2: number,
  t2: number
): number {
  const distanciaMetros = calcularDistancia(
    lat1,
    lon1,
    lat2,
    lon2
  );

  const tempoSegundos = (t2 - t1) / 1000;

  if (tempoSegundos <= 0) return 0;

  return (distanciaMetros / tempoSegundos) * 3.6;
}

function coordenadaValida(pontoGPS: PontoGPS): boolean {
  return (
    Number.isFinite(pontoGPS.lat) &&
    Number.isFinite(pontoGPS.lng) &&
    Number.isFinite(pontoGPS.timestamp) &&
    pontoGPS.lat >= -90 &&
    pontoGPS.lat <= 90 &&
    pontoGPS.lng >= -180 &&
    pontoGPS.lng <= 180
  );
}

/**
 * Gera uma zona morta proporcional à precisão declarada pelo aparelho.
 * Pequenas oscilações dentro dessa zona são tratadas como ruído, não como
 * deslocamento da máquina.
 */
export function calcularLimiarMovimentoGPS(
  novoPonto: PontoGPS,
  ultimoPonto?: PontoGPS
): number {
  const precisaoAtual =
    Number.isFinite(novoPonto.accuracy) &&
    (novoPonto.accuracy ?? 0) > 0
      ? novoPonto.accuracy ?? 0
      : 0;

  const precisaoAnterior =
    Number.isFinite(ultimoPonto?.accuracy) &&
    (ultimoPonto?.accuracy ?? 0) > 0
      ? ultimoPonto?.accuracy ?? 0
      : 0;

  const precisaoReferencia = Math.min(
    GPS_PRECISAO_MAXIMA_METROS,
    Math.max(precisaoAtual, precisaoAnterior)
  );

  return Math.min(
    5,
    Math.max(1.5, precisaoReferencia * 0.35)
  );
}

/**
 * Avalia qualidade, salto e movimento sem confundir oscilação parado com
 * deslocamento operacional.
 */
export function avaliarPontoGPS(
  novoPonto: PontoGPS,
  ultimoPonto?: PontoGPS
): AvaliacaoPontoGPS {
  const limiarMovimentoMetros =
    calcularLimiarMovimentoGPS(novoPonto, ultimoPonto);

  if (!coordenadaValida(novoPonto)) {
    return {
      valido: false,
      emMovimento: false,
      distanciaMetros: 0,
      velocidadeKmH: 0,
      limiarMovimentoMetros,
      motivo: 'coordenada_invalida'
    };
  }

  if (
    Number.isFinite(novoPonto.accuracy) &&
    (novoPonto.accuracy ?? 0) >
      GPS_PRECISAO_MAXIMA_METROS
  ) {
    return {
      valido: false,
      emMovimento: false,
      distanciaMetros: 0,
      velocidadeKmH: 0,
      limiarMovimentoMetros,
      motivo: 'precisao_insuficiente'
    };
  }

  if (!ultimoPonto) {
    return {
      valido: true,
      emMovimento: false,
      distanciaMetros: 0,
      velocidadeKmH: 0,
      limiarMovimentoMetros
    };
  }

  const intervaloMs =
    novoPonto.timestamp - ultimoPonto.timestamp;

  if (intervaloMs < GPS_INTERVALO_MINIMO_MS) {
    return {
      valido: false,
      emMovimento: false,
      distanciaMetros: 0,
      velocidadeKmH: 0,
      limiarMovimentoMetros,
      motivo: 'intervalo_invalido'
    };
  }

  const distanciaMetros = calcularDistancia(
    ultimoPonto.lat,
    ultimoPonto.lng,
    novoPonto.lat,
    novoPonto.lng
  );

  const velocidadeKmH = calcularVelocidade(
    ultimoPonto.lat,
    ultimoPonto.lng,
    ultimoPonto.timestamp,
    novoPonto.lat,
    novoPonto.lng,
    novoPonto.timestamp
  );

  if (
    !Number.isFinite(velocidadeKmH) ||
    velocidadeKmH >
      GPS_VELOCIDADE_MAXIMA_OPERACIONAL_KMH
  ) {
    return {
      valido: false,
      emMovimento: false,
      distanciaMetros,
      velocidadeKmH,
      limiarMovimentoMetros,
      motivo: 'velocidade_incompativel'
    };
  }

  return {
    valido: true,
    emMovimento:
      distanciaMetros >= limiarMovimentoMetros,
    distanciaMetros,
    velocidadeKmH,
    limiarMovimentoMetros
  };
}

/**
 * Mantém compatibilidade com chamadas antigas que precisam apenas saber se
 * o ponto possui qualidade suficiente.
 */
export function validarPontoGPS(
  novoPonto: PontoGPS,
  ultimoPonto?: PontoGPS
): boolean {
  return avaliarPontoGPS(
    novoPonto,
    ultimoPonto
  ).valido;
}
