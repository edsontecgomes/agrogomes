import {
  CoordenadaGeografica,
  gerarGridGeograficoBasico,
  gerarGridGeograficoZonado,
} from "../../geometria";

import {
  converterGridParaUEIs,
  UEIGeometrica,
} from "./converterGridParaUEIs";

export type GerarUEIsGeograficasTalhaoParams = {
  producerId: string;

  farmId: string;

  talhaoId: string;

  nomeTalhao: string;

  coordenadasTalhao: CoordenadaGeografica[];

  /**
   * Limite interno que separa a bordadura agronômica
   * do núcleo produtivo.
   */
  limiteNucleoProdutivo?: CoordenadaGeografica[];

  /**
   * Área aproximada desejada para cada UEI.
   *
   * O valor padrão é 1 hectare.
   */
  areaAlvoHa?: number;

  /**
   * Área mínima aceita para células parciais localizadas
   * nas extremidades do polígono.
   *
   * O valor padrão é 0,2 hectare.
   */
  areaMinimaHa?: number;
};

function validarParametros(
  params: GerarUEIsGeograficasTalhaoParams,
): void {
  if (!params.producerId) {
    throw new Error(
      "Não foi possível gerar as UEIs: producerId não informado.",
    );
  }

  if (!params.farmId) {
    throw new Error(
      "Não foi possível gerar as UEIs: farmId não informado.",
    );
  }

  if (!params.talhaoId) {
    throw new Error(
      "Não foi possível gerar as UEIs: talhaoId não informado.",
    );
  }

  if (!params.nomeTalhao.trim()) {
    throw new Error(
      "Não foi possível gerar as UEIs: nome do talhão não informado.",
    );
  }

  if (
    !params.coordenadasTalhao ||
    params.coordenadasTalhao.length < 3
  ) {
    throw new Error(
      "Não foi possível gerar as UEIs: o talhão não possui um polígono válido.",
    );
  }

  if (
    params.areaAlvoHa !== undefined &&
    (
      !Number.isFinite(params.areaAlvoHa) ||
      params.areaAlvoHa <= 0
    )
  ) {
    throw new Error(
      "Não foi possível gerar as UEIs: área-alvo inválida.",
    );
  }

  if (
    params.areaMinimaHa !== undefined &&
    (
      !Number.isFinite(params.areaMinimaHa) ||
      params.areaMinimaHa <= 0
    )
  ) {
    throw new Error(
      "Não foi possível gerar as UEIs: área mínima inválida.",
    );
  }

  if (
    params.areaAlvoHa !== undefined &&
    params.areaMinimaHa !== undefined &&
    params.areaMinimaHa > params.areaAlvoHa
  ) {
    throw new Error(
      "Não foi possível gerar as UEIs: a área mínima não pode ser maior que a área-alvo.",
    );
  }
}

export function gerarUEIsGeograficasTalhao(
  params: GerarUEIsGeograficasTalhaoParams,
): UEIGeometrica[] {
  validarParametros(params);

  const possuiNucleo =
    Boolean(
      params.limiteNucleoProdutivo &&
      params.limiteNucleoProdutivo.length >=
        3,
    );

  const grid = possuiNucleo
    ? gerarGridGeograficoZonado({
        talhaoId:
          params.talhaoId,

        coordenadasTalhao:
          params.coordenadasTalhao,

        limiteNucleoProdutivo:
          params.limiteNucleoProdutivo!,

        areaAlvoHa:
          params.areaAlvoHa ?? 1,

        areaMinimaNucleoHa:
          Math.min(
            params.areaMinimaHa ??
              0.2,
            0.01,
          ),

        areaMinimaBordaduraHa:
          0.01,
      })
    : gerarGridGeograficoBasico({
        talhaoId:
          params.talhaoId,

        coordenadasTalhao:
          params.coordenadasTalhao,

        areaAlvoHa:
          params.areaAlvoHa ?? 1,

        areaMinimaHa:
          params.areaMinimaHa ??
          0.2,
      }).map((celula) => ({
        ...celula,
        zonaTalhao:
          "nucleo_produtivo" as const,
      }));

  if (!grid.length) {
    throw new Error(
      `Nenhuma UEI geográfica válida foi gerada para o talhão ${params.talhaoId}.`,
    );
  }

  return converterGridParaUEIs({
    producerId: params.producerId,

    farmId: params.farmId,

    talhaoId: params.talhaoId,

    nomeTalhao: params.nomeTalhao,

    grid,
  });
}
