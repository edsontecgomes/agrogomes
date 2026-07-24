import { criarBufferInterno } from "../../geometria/buffer/criarBufferInterno";

import {
  validarPercentualBordadura,
} from "./bordadura";

import {
  PoligonoTalhao,
} from "./tiposGeometria";

export type AreaOperacionalTalhao = {
  limiteOriginal: PoligonoTalhao;

  limiteOperacional: PoligonoTalhao;

  areaTotalHa: number;

  areaOperacionalHa: number;

  bordaduraPercentual: number;
};

function validarLimiteOriginal(
  limiteOriginal: PoligonoTalhao,
): void {
  if (
    !limiteOriginal ||
    !Array.isArray(limiteOriginal.pontos) ||
    limiteOriginal.pontos.length < 3
  ) {
    throw new Error(
      "Não foi possível criar a área operacional: o talhão não possui um polígono válido.",
    );
  }

  limiteOriginal.pontos.forEach(
    (ponto, indice) => {
      if (
        !Number.isFinite(ponto.lat) ||
        !Number.isFinite(ponto.lng)
      ) {
        throw new Error(
          `Não foi possível criar a área operacional: coordenada inválida na posição ${indice + 1}.`,
        );
      }
    },
  );
}

function validarAreaTotal(
  areaTotalHa: number,
): void {
  if (
    !Number.isFinite(areaTotalHa) ||
    areaTotalHa <= 0
  ) {
    throw new Error(
      "Não foi possível criar a área operacional: área total inválida.",
    );
  }
}

export function criarAreaOperacional(
  limiteOriginal: PoligonoTalhao,
  areaTotalHa: number,
  bordaduraPercentual = 4,
): AreaOperacionalTalhao {
  validarLimiteOriginal(limiteOriginal);

  validarAreaTotal(areaTotalHa);

  const percentualValidado =
    validarPercentualBordadura(
      bordaduraPercentual,
    );

  const resultadoBuffer =
    criarBufferInterno(
      limiteOriginal.pontos,
      percentualValidado,
    );

  if (
    !resultadoBuffer.geometria ||
    resultadoBuffer.geometria.length < 3
  ) {
    throw new Error(
      "Não foi possível criar a área operacional: o buffer interno gerou uma geometria inválida.",
    );
  }

  if (
    !Number.isFinite(resultadoBuffer.areaHa) ||
    resultadoBuffer.areaHa <= 0
  ) {
    throw new Error(
      "Não foi possível criar a área operacional: o buffer interno gerou uma área inválida.",
    );
  }

  return {
    limiteOriginal,

    limiteOperacional: {
      pontos: resultadoBuffer.geometria,
    },

    areaTotalHa,

    /**
     * A área operacional agora é calculada a partir
     * do novo polígono produzido pelo buffer Turf.
     *
     * Ela não é mais apenas uma redução matemática
     * aplicada sobre a área total.
     */
    areaOperacionalHa:
      resultadoBuffer.areaHa,

    bordaduraPercentual:
      percentualValidado,
  };
}
