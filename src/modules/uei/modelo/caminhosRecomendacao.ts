export type CaminhoRecomendacao =
  | "ajuste_incremental"
  | "potencial_estrutural";

export type RecomendacaoCientifica = {
  caminho: CaminhoRecomendacao;
  titulo: string;
  descricao: string;
  ganhoEstimadoScHa?: number;
  prioridade: number;
};

export function criarRecomendacaoIncremental(
  titulo: string,
  descricao: string,
  ganhoEstimadoScHa?: number,
): RecomendacaoCientifica {
  return {
    caminho: "ajuste_incremental",
    titulo,
    descricao,
    ganhoEstimadoScHa,
    prioridade: 2,
  };
}

export function criarRecomendacaoEstrutural(
  titulo: string,
  descricao: string,
): RecomendacaoCientifica {
  return {
    caminho: "potencial_estrutural",
    titulo,
    descricao,
    prioridade: 1,
  };
}