import buffer from "@turf/buffer";
import area from "@turf/area";
import type { Feature, Polygon } from "geojson";

import {
  CoordenadaGeografica,
} from "../centroide";

import {
  criarPoligonoTurf,
  converterPoligonoParaCoordenadas,
} from "../polygon";

export type ResultadoBufferInterno = {
  geometria: CoordenadaGeografica[];

  areaHa: number;
};

function validarPercentual(
  percentual: number,
) {
  if (
    !Number.isFinite(percentual) ||
    percentual <= 0 ||
    percentual >= 50
  ) {
    throw new Error(
      "Percentual de bordadura inválido.",
    );
  }
}

/**
 * Cria um buffer negativo aproximado
 * preservando o formato do talhão.
 *
 * A distância do buffer é estimada
 * utilizando a área do polígono.
 *
 * Esta abordagem é suficientemente
 * precisa para bordaduras operacionais.
 */
export function criarBufferInterno(
  coordenadas: CoordenadaGeografica[],
  percentual: number,
): ResultadoBufferInterno {

  validarPercentual(percentual);

  const poligono =
    criarPoligonoTurf(coordenadas);

  const areaM2 =
    area(poligono);

  /**
   * Distância aproximada necessária
   * para reduzir a área conforme
   * o percentual informado.
   */

  const distanciaMetros =
    Math.sqrt(areaM2)
    *
    (percentual / 100)
    /
    2;

  const resultado =
    buffer(
      poligono,
      -distanciaMetros,
      {
        units: "meters",
      },
    );

  if (
    !resultado ||
    resultado.geometry.type !== "Polygon"
  ) {
    throw new Error(
      "Não foi possível gerar a área operacional do talhão.",
    );
  }

  const novaArea =
    area(resultado);

  return {

    geometria:
      converterPoligonoParaCoordenadas(
        resultado as Feature<Polygon>,
      ),

    areaHa:
      Number(
        (
          novaArea / 10000
        ).toFixed(4),
      ),
  };
}