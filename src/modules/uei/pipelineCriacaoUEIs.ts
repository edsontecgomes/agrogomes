import { CoordenadaGeografica } from "../geometria";

import {
  gerarUEIsGeograficasTalhao,
} from "./geometria/gerarUEIsGeograficasTalhao";

import {
  ResultadoPersistenciaUEI,
  salvarUEIs,
} from "./salvarUEIs";

import { Uei } from "./types";

export type PipelineCriacaoUEIsParams = {
  producerId: string;

  farmId: string;

  talhaoId: string;

  nomeTalhao: string;

  coordenadasTalhao: CoordenadaGeografica[];

  areaAlvoHa?: number;

  areaMinimaHa?: number;
};

export type ResultadoPipelineCriacaoUEIs = {
  sucesso: boolean;

  talhaoId: string;

  totalUEIs: number;

  totalGDAs: number;

  areaTotalUEIsHa: number;

  ueis: Uei[];

  persistencias: ResultadoPersistenciaUEI[];
};

function validarParametros(
  params: PipelineCriacaoUEIsParams,
): void {
  if (!params.producerId) {
    throw new Error(
      "Não foi possível executar o pipeline: producerId não informado.",
    );
  }

  if (!params.farmId) {
    throw new Error(
      "Não foi possível executar o pipeline: farmId não informado.",
    );
  }

  if (!params.talhaoId) {
    throw new Error(
      "Não foi possível executar o pipeline: talhaoId não informado.",
    );
  }

  if (!params.nomeTalhao.trim()) {
    throw new Error(
      "Não foi possível executar o pipeline: nome do talhão não informado.",
    );
  }

  if (
    !params.coordenadasTalhao ||
    params.coordenadasTalhao.length < 3
  ) {
    throw new Error(
      "Não foi possível executar o pipeline: geometria do talhão inválida.",
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
      "Não foi possível executar o pipeline: área-alvo inválida.",
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
      "Não foi possível executar o pipeline: área mínima inválida.",
    );
  }

  if (
    params.areaAlvoHa !== undefined &&
    params.areaMinimaHa !== undefined &&
    params.areaMinimaHa > params.areaAlvoHa
  ) {
    throw new Error(
      "Não foi possível executar o pipeline: a área mínima não pode ser maior que a área-alvo.",
    );
  }
}

function somarAreaUEIs(
  ueis: Uei[],
): number {
  const areaTotal = ueis.reduce(
    (total, uei) =>
      total + uei.areaHa,
    0,
  );

  return Number(
    areaTotal.toFixed(4),
  );
}

export async function pipelineCriacaoUEIs(
  params: PipelineCriacaoUEIsParams,
): Promise<ResultadoPipelineCriacaoUEIs> {
  validarParametros(params);

  const ueisGeradas =
    gerarUEIsGeograficasTalhao({
      producerId: params.producerId,

      farmId: params.farmId,

      talhaoId: params.talhaoId,

      nomeTalhao: params.nomeTalhao,

      coordenadasTalhao:
        params.coordenadasTalhao,

      areaAlvoHa:
        params.areaAlvoHa ?? 1,

      areaMinimaHa:
        params.areaMinimaHa ?? 0.2,
    });

  const ueis: Uei[] =
    ueisGeradas.map((uei) => ({
      id: uei.id,

      producerId: uei.producerId,

      farmId: uei.farmId,

      talhaoId: uei.talhaoId,

      codigo: uei.codigo,

      nome: uei.nome,

      numero: uei.numero,

      areaHa: uei.areaHa,

      geometria: uei.geometria,

      centroide: uei.centroide,

      origem: uei.origem,

      status: uei.status,

      criadoEm: uei.criadoEm,

      atualizadoEm: uei.atualizadoEm,
    }));

  if (!ueis.length) {
    throw new Error(
      `O pipeline não gerou UEIs válidas para o talhão ${params.talhaoId}.`,
    );
  }

  const persistencias =
    await salvarUEIs(ueis);

  return {
    sucesso: true,

    talhaoId: params.talhaoId,

    totalUEIs: ueis.length,

    totalGDAs:
      persistencias.length,

    areaTotalUEIsHa:
      somarAreaUEIs(ueis),

    ueis,

    persistencias,
  };
}