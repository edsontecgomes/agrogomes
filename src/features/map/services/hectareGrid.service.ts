import { HectareCell, LatLng, Talhao } from "../types/map.types";

function getBoundingBox(points: LatLng[]) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

function getCenter(points: LatLng[]): LatLng {
  return {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  };
}

export function generateHectareGrid(talhao: Talhao): HectareCell[] {
  if (!talhao.polygon || talhao.polygon.length < 3) {
    return [];
  }

  const bbox = getBoundingBox(talhao.polygon);

  const latStep = 0.0009;
  const lngStep = 0.0009;

  const cells: HectareCell[] = [];
  let hectareIndex = 1;

  for (let lat = bbox.minLat; lat < bbox.maxLat; lat += latStep) {
    for (let lng = bbox.minLng; lng < bbox.maxLng; lng += lngStep) {
      const polygon: LatLng[] = [
        { lat, lng },
        { lat, lng: lng + lngStep },
        { lat: lat + latStep, lng: lng + lngStep },
        { lat: lat + latStep, lng },
      ];

      cells.push({
        id: `${talhao.id}-ha-${hectareIndex}`,
        producerId: talhao.producerId,
        farmId: talhao.farmId,
        talhaoId: talhao.id,
        hectareIndex,
        areaHa: 1,
        center: getCenter(polygon),
        polygon,
        iqh: 0,
        status: "desconhecido",
      });

      hectareIndex++;
    }
  }

  return cells;
}