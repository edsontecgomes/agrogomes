import type {
  ConhecimentoAgronomico,
} from "./types";

export type IndiceConhecimentoGDA = {
  gdaId: string;

  totalConhecimentos: number;

  totalMaduros: number;

  totalContraditorios: number;

  indiceConhecimento: number;

  confiabilidadeMedia: number;

  estabilidadeMedia: number;
};

function media(
  valores: number[],
): number {
  if (valores.length === 0) {
    return 0;
  }

  return (
    valores.reduce(
      (total, valor) =>
        total + valor,
      0,
    ) / valores.length
  );
}

export function criarIndiceConhecimentoGDA(
  gdaId: string,
  conhecimentos: ConhecimentoAgronomico[],
): IndiceConhecimentoGDA {
  const conhecimentosDoGDA =
    conhecimentos.filter(
      (conhecimento) =>
        conhecimento.gdaId === gdaId ||
        conhecimento.entidadeId ===
          gdaId,
    );

  const forcaMedia =
    media(
      conhecimentosDoGDA.map(
        (conhecimento) =>
          conhecimento.forca,
      ),
    );

  const confiabilidadeMedia =
    media(
      conhecimentosDoGDA.map(
        (conhecimento) =>
          conhecimento.confiabilidade,
      ),
    );

  const estabilidadeMedia =
    media(
      conhecimentosDoGDA.map(
        (conhecimento) =>
          conhecimento.estabilidade,
      ),
    );

  const indiceConhecimento =
    forcaMedia * 0.4 +
    confiabilidadeMedia *
      100 *
      0.3 +
    estabilidadeMedia * 0.3;

  return {
    gdaId,

    totalConhecimentos:
      conhecimentosDoGDA.length,

    totalMaduros:
      conhecimentosDoGDA.filter(
        (conhecimento) =>
          conhecimento.status ===
          "maduro",
      ).length,

    totalContraditorios:
      conhecimentosDoGDA.filter(
        (conhecimento) =>
          conhecimento.status ===
          "contraditorio",
      ).length,

    indiceConhecimento: Number(
      Math.min(
        100,
        indiceConhecimento,
      ).toFixed(2),
    ),

    confiabilidadeMedia: Number(
      confiabilidadeMedia.toFixed(2),
    ),

    estabilidadeMedia: Number(
      estabilidadeMedia.toFixed(2),
    ),
  };
}