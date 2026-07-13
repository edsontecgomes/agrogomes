import type {
  CriterioRecomendacao,
} from "./types";

type CriarCriterioParams = {
  id: string;

  nome: string;

  descricao: string;

  peso?: number;

  atendido: boolean;

  valorObservado?: unknown;

  valorEsperado?: unknown;

  conhecimentoId?: string;
};

export function criarCriterioRecomendacao(
  params: CriarCriterioParams,
): CriterioRecomendacao {
  const peso = Math.max(
    0,
    params.peso ?? 1,
  );

  return {
    id: params.id,

    nome: params.nome,

    descricao: params.descricao,

    peso,

    atendido: params.atendido,

    pontuacao:
      params.atendido
        ? peso
        : 0,

    valorObservado:
      params.valorObservado,

    valorEsperado:
      params.valorEsperado,

    conhecimentoId:
      params.conhecimentoId,
  };
}