import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

/**
 * Verifica se um ponto está dentro de um polígono GeoJSON
 */
export function isPointInPolygon(lat: number, lng: number, coordinates: number[][]): boolean {
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
 * Calcula a distância entre dois pontos (Haversine formula)
 * @returns Distância em metros
 */
export function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calcula a velocidade entre dois pontos
 * @returns Velocidade em km/h
 */
export function calcularVelocidade(
  lat1: number,
  lon1: number,
  t1: number,
  lat2: number,
  lon2: number,
  t2: number
): number {
  const dist = calcularDistancia(lat1, lon1, lat2, lon2);
  const timeSec = (t2 - t1) / 1000;
  
  if (timeSec <= 0) return 0;
  
  const speedMps = dist / timeSec;
  return speedMps * 3.6; // m/s to km/h
}

/**
 * Valida se um ponto GPS é aceitável para o trajeto operacional
 */
export function validarPontoGPS(
  novoPonto: { lat: number; lng: number; timestamp: number; accuracy?: number },
  ultimoPonto?: { lat: number; lng: number; timestamp: number; accuracy?: number }
): boolean {
  // 1. Precisão ruim (>20m)
  if (novoPonto.accuracy && novoPonto.accuracy > 20) return false;

  if (ultimoPonto) {
    const dist = calcularDistancia(ultimoPonto.lat, ultimoPonto.lng, novoPonto.lat, novoPonto.lng);
    const speed = calcularVelocidade(
      ultimoPonto.lat,
      ultimoPonto.lng,
      ultimoPonto.timestamp,
      novoPonto.lat,
      novoPonto.lng,
      novoPonto.timestamp
    );

    // 2. Pontos duplicados (distância irrelevante)
    if (dist < 0.5) return false;

    // 3. Deslocamentos irreais (> 60km/h para máquinas agrícolas é improvável em operação)
    if (speed > 60) return false;
  }

  return true;
}
