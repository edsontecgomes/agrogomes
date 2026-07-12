import { agruparAmostrasPorEntidade } from "./agruparAmostrasPorEntidade";
import { calcularConfiabilidadeAmostra } from "./calcularConfiabilidadeAmostra";
import { calcularResumoEstatistico } from "./calcularResumoEstatistico";
import { AmostraEstatistica } from "./types";

export type ItemRankingEntidade = {
  posicao: number;

  entidadeId: string;

  fator: string;

  media: number;

  mediana: number;

  quantidadeAmostras: number;

  confiabilidade: number;
};

export function criarRankingEntidades(
  amostras: AmostraEstatistica[],
  fator: string,
  ordem: "maior_primeiro" | "menor_primeiro" =
    "maior_primeiro",
): ItemRankingEntidade[] {
  const amostrasDoFator =
    amostras.filter(
      (amostra) =>
        amostra.fator === fator &&
        Boolean(amostra.entidadeId) &&
        Number.isFinite(amostra.valor),
    );

  const grupos =
    agruparAmostrasPorEntidade(
      amostrasDoFator,
    );

  const itens = grupos.map((grupo) => {
    const valores = grupo.amostras.map(
      (amostra) => amostra.valor,
    );

    const resumo =
      calcularResumoEstatistico(
        valores,
      );

    return {
      posicao: 0,

      entidadeId:
        grupo.entidadeId,

      fator,

      media:
        resumo.media,

      mediana:
        resumo.mediana,

      quantidadeAmostras:
        resumo.quantidade,

      confiabilidade:
        calcularConfiabilidadeAmostra(
          resumo,
        ),
    };
  });

  itens.sort((primeiro, segundo) =>
    ordem === "maior_primeiro"
      ? segundo.media - primeiro.media
      : primeiro.media - segundo.media,
  );

  return itens.map(
    (item, indice) => ({
      ...item,

      posicao:
        indice + 1,
    }),
  );
}