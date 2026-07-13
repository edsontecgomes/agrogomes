import type {
  NivelRiscoRecomendacao,
  RiscoRecomendacao,
} from "./types";

function classificarNivel(
  pontuacao: number,
): NivelRiscoRecomendacao {
  if (pontuacao >= 80) {
    return "muito_alto";
  }

  if (pontuacao >= 60) {
    return "alto";
  }

  if (pontuacao >= 35) {
    return "moderado";
  }

  if (pontuacao >= 15) {
    return "baixo";
  }

  return "muito_baixo";
}

type CriarRiscoParams = {
  id: string;

  nome: string;

  descricao: string;

  probabilidade: number;

  impacto: number;

  impeditivo?: boolean;

  conhecimentoId?: string;
};

export function criarRiscoRecomendacao(
  params: CriarRiscoParams,
): RiscoRecomendacao {
  const probabilidade = Math.max(
    0,
    Math.min(
      1,
      params.probabilidade,
    ),
  );

  const impacto = Math.max(
    0,
    Math.min(
      1,
      params.impacto,
    ),
  );

  const pontuacao =
    probabilidade *
    impacto *
    100;

  return {
    id: params.id,

    nome: params.nome,

    descricao: params.descricao,

    nivel:
      classificarNivel(
        pontuacao,
      ),

    probabilidade,

    impacto,

    pontuacao: Number(
      pontuacao.toFixed(2),
    ),

    impeditivo:
      params.impeditivo ?? false,

    conhecimentoId:
      params.conhecimentoId,
  };
}