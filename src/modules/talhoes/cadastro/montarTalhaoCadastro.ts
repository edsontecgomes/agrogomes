import {
  CoordenadaCadastroTalhao,
  TalhaoCadastro,
} from "./talhaoCadastro";

import { calcularCentroideTalhao } from "./centroideTalhao";

import {
  normalizarBordaduraTalhao,
} from "./bordaduraTalhao";

import { calcularPerimetroTalhao } from "./perimetroTalhao";

import {
  criarBufferInterno,
} from "../../geometria/buffer/criarBufferInterno";

function validarParametros(params: {
  farmId: string;
  nome: string;
  coordenadas: CoordenadaCadastroTalhao[];
  areaHa: number;
}): void {
  if (!params.farmId.trim()) {
    throw new Error(
      "Não foi possível montar o talhão: farmId não informado.",
    );
  }

  if (!params.nome.trim()) {
    throw new Error(
      "Não foi possível montar o talhão: nome não informado.",
    );
  }

  if (
    !Array.isArray(params.coordenadas) ||
    params.coordenadas.length < 3
  ) {
    throw new Error(
      "Não foi possível montar o talhão: são necessárias pelo menos três coordenadas.",
    );
  }

  params.coordenadas.forEach(
    (coordenada, indice) => {
      if (
        !Number.isFinite(coordenada.lat) ||
        !Number.isFinite(coordenada.lng)
      ) {
        throw new Error(
          `Não foi possível montar o talhão: coordenada inválida na posição ${indice + 1}.`,
        );
      }
    },
  );

  if (
    !Number.isFinite(params.areaHa) ||
    params.areaHa <= 0
  ) {
    throw new Error(
      "Não foi possível montar o talhão: área total inválida.",
    );
  }
}

export function montarTalhaoCadastro(params: {
  farmId: string;
  nome: string;
  coordenadas: CoordenadaCadastroTalhao[];
  areaHa: number;
  bordaduraPercentual?: number;
}): TalhaoCadastro {
  validarParametros(params);

  const bordaduraPercentual =
    normalizarBordaduraTalhao(
      params.bordaduraPercentual,
    );

  const resultadoBuffer =
    criarBufferInterno(
      params.coordenadas,
      bordaduraPercentual,
    );

  if (
    !Array.isArray(resultadoBuffer.geometria) ||
    resultadoBuffer.geometria.length < 3
  ) {
    throw new Error(
      "Não foi possível montar o talhão: o limite operacional gerado é inválido.",
    );
  }

  if (
    !Number.isFinite(resultadoBuffer.areaHa) ||
    resultadoBuffer.areaHa <= 0
  ) {
    throw new Error(
      "Não foi possível montar o talhão: a área operacional gerada é inválida.",
    );
  }

  return {
    farmId: params.farmId,

    nome: params.nome.trim(),

    coordenadas: params.coordenadas,

    limiteOperacional:
      resultadoBuffer.geometria,

    areaHa: params.areaHa,

    perimetroMetros:
      calcularPerimetroTalhao(
        params.coordenadas,
      ),

    centroide:
      calcularCentroideTalhao(
        params.coordenadas,
      ),

    bordaduraPercentual,

    areaOperacionalHa:
      resultadoBuffer.areaHa,

    status: "ativo",
  };
}