import {
  CoordenadaCadastroTalhao,
  TalhaoCadastro,
} from "./talhaoCadastro";

import { calcularCentroideTalhao } from "./centroideTalhao";

import {
  BORDADURA_AGRONOMICA_PERCENTUAL,
  DISTANCIA_SEGURANCA_OPERACIONAL_METROS,
  normalizarBordaduraTalhao,
} from "./bordaduraTalhao";

import { calcularPerimetroTalhao } from "./perimetroTalhao";

import {
  criarBufferInterno,
  criarBufferInternoMetros,
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

  const resultadoAtivacao =
    criarBufferInternoMetros(
      params.coordenadas,
      DISTANCIA_SEGURANCA_OPERACIONAL_METROS,
    );

  if (
    !Array.isArray(resultadoAtivacao.geometria) ||
    resultadoAtivacao.geometria.length < 3
  ) {
    throw new Error(
      "Não foi possível montar o talhão: o limite operacional gerado é inválido.",
    );
  }

  if (
    !Number.isFinite(resultadoAtivacao.areaHa) ||
    resultadoAtivacao.areaHa <= 0
  ) {
    throw new Error(
      "Não foi possível montar o talhão: a área interna de segurança de 20 metros é inválida.",
    );
  }

  const resultadoNucleo =
    criarBufferInterno(
      params.coordenadas,
      bordaduraPercentual,
    );

  if (
    !Array.isArray(resultadoNucleo.geometria) ||
    resultadoNucleo.geometria.length < 3 ||
    !Number.isFinite(resultadoNucleo.areaHa) ||
    resultadoNucleo.areaHa <= 0 ||
    resultadoNucleo.areaHa >
      params.areaHa
  ) {
    throw new Error(
      "Não foi possível montar o talhão: o núcleo produtivo gerado é inválido.",
    );
  }

  const areaBordaduraAgronomicaHa = Number(
    Math.max(
      0,
      params.areaHa -
        resultadoNucleo.areaHa,
    ).toFixed(4),
  );

  return {
    farmId: params.farmId,

    nome: params.nome.trim(),

    coordenadas: params.coordenadas,

    limiteOperacional:
      resultadoAtivacao.geometria,

    limiteAtivacaoOperacional:
      resultadoAtivacao.geometria,

    limiteNucleoProdutivo:
      resultadoNucleo.geometria,

    areaHa: params.areaHa,

    perimetroMetros:
      calcularPerimetroTalhao(
        params.coordenadas,
      ),

    centroide:
      calcularCentroideTalhao(
        params.coordenadas,
      ),

    bordaduraPercentual:
      BORDADURA_AGRONOMICA_PERCENTUAL,

    bordaduraAgronomicaPercentual:
      BORDADURA_AGRONOMICA_PERCENTUAL,

    distanciaSegurancaOperacionalMetros:
      DISTANCIA_SEGURANCA_OPERACIONAL_METROS,

    areaOperacionalHa:
      resultadoAtivacao.areaHa,

    areaAtivacaoOperacionalHa:
      resultadoAtivacao.areaHa,

    areaBordaduraAgronomicaHa,

    areaNucleoProdutivoHa:
      resultadoNucleo.areaHa,

    status: "ativo",
  };
}
