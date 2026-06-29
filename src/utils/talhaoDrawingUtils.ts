import {
  TalhaoDrawingPoint,
  TalhaoGridCell,
} from "../types/talhaoDrawing";

const EARTH_RADIUS_M = 6371000;

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceMeters(
  a: TalhaoDrawingPoint,
  b: TalhaoDrawingPoint
): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function calcularPerimetroTalhao(
  points: TalhaoDrawingPoint[]
): number {
  if (points.length < 2) return 0;

  let total = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];

    total += distanceMeters(current, next);
  }

  return Math.round(total);
}

export function calcularAreaTalhaoHa(
  points: TalhaoDrawingPoint[]
): number {
  if (points.length < 3) return 0;

  const avgLat =
    points.reduce((total, p) => total + p.latitude, 0) /
    points.length;

  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng =
    111320 * Math.cos(toRad(avgLat));

  const projected = points.map((point) => ({
    x: point.longitude * metersPerDegreeLng,
    y: point.latitude * metersPerDegreeLat,
  }));

  let areaM2 = 0;

  for (let i = 0; i < projected.length; i += 1) {
    const current = projected[i];
    const next = projected[(i + 1) % projected.length];

    areaM2 += current.x * next.y - next.x * current.y;
  }

  return Math.abs(areaM2 / 2) / 10000;
}

export function gerarGridSimplificado1Ha(
  points: TalhaoDrawingPoint[]
): TalhaoGridCell[] {
  const areaHa = calcularAreaTalhaoHa(points);

  if (points.length < 3 || areaHa <= 0) return [];

  const quantidadeCelulas = Math.max(1, Math.round(areaHa));

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);

  const north = Math.max(...latitudes);
  const south = Math.min(...latitudes);
  const east = Math.max(...longitudes);
  const west = Math.min(...longitudes);

  const cols = Math.ceil(Math.sqrt(quantidadeCelulas));
  const rows = Math.ceil(quantidadeCelulas / cols);

  const latStep = (north - south) / rows;
  const lngStep = (east - west) / cols;

  const cells: TalhaoGridCell[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (cells.length >= quantidadeCelulas) break;

      const index = cells.length + 1;

      cells.push({
        id: `cell-${index}`,
        areaHa: 1,
        label: "1 ha",
        bounds: {
          north: north - row * latStep,
          south: north - (row + 1) * latStep,
          west: west + col * lngStep,
          east: west + (col + 1) * lngStep,
        },
      });
    }
  }

  return cells;
}

export function criarPontoTalhao(
  latitude: number,
  longitude: number
): TalhaoDrawingPoint {
  return {
    id: crypto.randomUUID(),
    latitude,
    longitude,
  };
}