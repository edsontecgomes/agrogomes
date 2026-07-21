import {
  CoordenadaCadastroTalhao,
} from "./talhaoCadastro";

import {
  montarTalhaoCadastro,
} from "./montarTalhaoCadastro";

import {
  validarTalhaoParaSalvar,
} from "./validarSalvarTalhao";

import {
  salvarTalhaoCadastro,
} from "./salvarTalhao";

import {
  pipelineCriacaoUEIs,
} from "../../uei/pipelineCriacaoUEIs";

export async function executarFluxoCriarTalhao(
  params: {
    farmId: string;

    producerId: string;

    nome: string;

    coordenadas:
      CoordenadaCadastroTalhao[];

    areaHa: number;

    bordaduraPercentual?: number;
  },
) {
  const talhao =
    montarTalhaoCadastro({
      farmId:
        params.farmId,

      nome:
        params.nome,

      coordenadas:
        params.coordenadas,

      areaHa:
        params.areaHa,

      bordaduraPercentual:
        params.bordaduraPercentual,
    });

  const validacao =
    validarTalhaoParaSalvar(
      talhao,
    );

  if (!validacao.valido) {
    return {
      sucesso: false,

      mensagens:
        validacao.mensagens,

      talhao: null,

      ueis: null,
    };
  }

  const salvo =
    await salvarTalhaoCadastro(
      talhao,
      params.producerId,
    );

  const resultadoUEIs =
    await pipelineCriacaoUEIs({
      producerId:
        params.producerId,

      farmId:
        params.farmId,

      talhaoId:
        salvo.id,

      nomeTalhao:
        params.nome,

      coordenadasTalhao:
        talhao.limiteOperacional,

      areaAlvoHa: 1,

      areaMinimaHa: 0.2,
    });

  return {
    sucesso: true,

    mensagens: [
      "Talhão cadastrado com sucesso.",

      `${resultadoUEIs.totalUEIs} UEIs criadas.`,

      `${resultadoUEIs.totalGDAs} GDAs criados.`,
    ],

    talhao:
      salvo,

    ueis:
      resultadoUEIs,
  };
}