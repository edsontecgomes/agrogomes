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

function validarDistanciaMetros(
  distanciaMetros: number,
) {
  if (
    !Number.isFinite(distanciaMetros) ||
    distanciaMetros <= 0
  ) {
    throw new Error(
      "Distância do limite operacional inválida.",
    );
  }
}

function executarBufferInterno(
  coordenadas: CoordenadaGeografica[],
  distanciaMetros: number,
): ResultadoBufferInterno {
  const poligono =
    criarPoligonoTurf(coordenadas);

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
      "Não foi possível gerar o limite interno do talhão.",
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

export function criarBufferInternoMetros(
  coordenadas: CoordenadaGeografica[],
  distanciaMetros: number,
): ResultadoBufferInterno {
  validarDistanciaMetros(
    distanciaMetros,
  );

  return executarBufferInterno(
    coordenadas,
    distanciaMetros,
  );
}

/**
 * Cria um buffer negativo aproximado para que
 * a faixa retirada represente o percentual
 * informado da área total.
 *
 * A distância do buffer é estimada
 * utilizando a área do polígono.
 *
 * Esta abordagem é destinada à bordadura
 * agronômica. A segurança operacional usa
 * criarBufferInternoMetros.
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

  const fracaoAreaNucleo =
    1 - percentual / 100;

  /**
   * Aproxima o talhão por um quadrado equivalente.
   * Assim, a retração ocorre nas duas extremidades
   * de cada eixo e a área removida fica próxima
   * do percentual solicitado.
   */
  const distanciaMetros =
    Math.sqrt(areaM2)
    * (
      1 -
      Math.sqrt(
        fracaoAreaNucleo,
      )
    )
    / 2;

  return executarBufferInterno(
    coordenadas,
    distanciaMetros,
  );
}
