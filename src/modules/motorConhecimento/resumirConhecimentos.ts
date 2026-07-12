import type {
  ConhecimentoAgronomico,
  ResumoConhecimentos,
} from "./types";

function calcularMedia(
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

export function resumirConhecimentos(
  conhecimentos: ConhecimentoAgronomico[],
): ResumoConhecimentos {
  return {
    totalConhecimentos:
      conhecimentos.length,

    totalConsolidados:
      conhecimentos.filter(
        (conhecimento) =>
          conhecimento.status ===
          "consolidado",
      ).length,

    totalMaduros:
      conhecimentos.filter(
        (conhecimento) =>
          conhecimento.status ===
          "maduro",
      ).length,

    totalContraditorios:
      conhecimentos.filter(
        (conhecimento) =>
          conhecimento.status ===
          "contraditorio",
      ).length,

    forcaMedia: Number(
      calcularMedia(
        conhecimentos.map(
          (conhecimento) =>
            conhecimento.forca,
        ),
      ).toFixed(2),
    ),

    confiabilidadeMedia: Number(
      calcularMedia(
        conhecimentos.map(
          (conhecimento) =>
            conhecimento.confiabilidade,
        ),
      ).toFixed(2),
    ),

    estabilidadeMedia: Number(
      calcularMedia(
        conhecimentos.map(
          (conhecimento) =>
            conhecimento.estabilidade,
        ),
      ).toFixed(2),
    ),

    fatoresPrincipais: Array.from(
      new Set(
        conhecimentos.map(
          (conhecimento) =>
            conhecimento.fatorPrincipal,
        ),
      ),
    ),
  };
}