import area from "@turf/area";
import intersect from "@turf/intersect";
import { featureCollection } from "@turf/helpers";
import type {
  Feature,
  MultiPolygon,
  Polygon,
} from "geojson";

import { converterUEIParaPoligonoTurf } from "./converterUEIParaPoligonoTurf";
import { FaixaOperacionalGeografica } from "./typesCobertura";
import { UEIEspacial } from "./types";

export function calcularIntersecaoCoberturaUEI(
  faixaOperacional: FaixaOperacionalGeografica,
  uei: UEIEspacial,
): {
  geometria: Feature<Polygon | MultiPolygon> | null;
  areaCobertaM2: number;
} {
  const poligonoUEI =
    converterUEIParaPoligonoTurf(uei);

  if (!poligonoUEI) {
    return {
      geometria: null,
      areaCobertaM2: 0,
    };
  }

  try {
    const recorte = intersect(
      featureCollection([
        faixaOperacional,
        poligonoUEI,
      ]),
    );

    if (!recorte) {
      return {
        geometria: null,
        areaCobertaM2: 0,
      };
    }

    return {
      geometria: recorte,
      areaCobertaM2: area(recorte),
    };
  } catch (error) {
    console.error(
      `Erro ao calcular cobertura da UEI ${uei.id}:`,
      error,
    );

    return {
      geometria: null,
      areaCobertaM2: 0,
    };
  }
}