import bbox from "@turf/bbox";
import squareGrid from "@turf/square-grid";
import intersect from "@turf/intersect";
import area from "@turf/area";
import centroid from "@turf/centroid";
import type { Feature, Polygon } from "geojson";
import { CoordenadaGeografica } from "../centroide";
import {
  converterPoligonoParaCoordenadas,
  criarPoligonoTurf,
} from "../polygon";
import type {
  UeiZonaTalhao,
} from "../../uei/types";

export type CelulaGridGeografico = {
  id: string;
  numero: number;
  areaHa: number;
  centroide: CoordenadaGeografica;
  geometria: CoordenadaGeografica[];
  origem: "grid_geografico";
  zonaTalhao?: UeiZonaTalhao;
};

type GerarGridGeograficoBasicoParams = {
  talhaoId: string;
  coordenadasTalhao: CoordenadaGeografica[];
  areaAlvoHa?: number;
  areaMinimaHa?: number;
};

export function gerarGridGeograficoBasico({
  talhaoId,
  coordenadasTalhao,
  areaAlvoHa = 1,
  areaMinimaHa = 0.2,
}: GerarGridGeograficoBasicoParams): CelulaGridGeografico[] {
  const poligonoTalhao = criarPoligonoTurf(coordenadasTalhao);

  const areaAlvoM2 = areaAlvoHa * 10_000;
  const areaMinimaM2 = areaMinimaHa * 10_000;

  const caixa = bbox(poligonoTalhao);

  const ladoKm = Math.sqrt(areaAlvoM2) / 1000;

  const grade = squareGrid(caixa, ladoKm, {
    units: "kilometers",
  });

  const celulas: CelulaGridGeografico[] = [];

  grade.features.forEach((celula) => {
    const recorte = intersect({
      type: "FeatureCollection",
      features: [poligonoTalhao, celula],
    });

    if (!recorte || recorte.geometry.type !== "Polygon") {
      return;
    }

    const areaCelulaM2 = area(recorte);

    if (areaCelulaM2 < areaMinimaM2) {
      return;
    }

    const centro = centroid(recorte);
    const [lng, lat] = centro.geometry.coordinates;

    celulas.push({
      id: `${talhaoId}-UEI-${String(celulas.length + 1).padStart(5, "0")}`,
      numero: celulas.length + 1,
      areaHa: Number((areaCelulaM2 / 10_000).toFixed(4)),
      centroide: { lat, lng },
      geometria: converterPoligonoParaCoordenadas(recorte as Feature<Polygon>),
      origem: "grid_geografico",
    });
  });

  return celulas;
}
