import type {
  NivelRiscoRecomendacao,
  RiscoRecomendacao,
} from "./types";

export type ResultadoRiscoTotal = {
  pontuacao: number;

  nivel:
    NivelRiscoRecomendacao;

  possuiImpedimento: boolean;
};

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

export function calcularRiscoTotal(
  riscos: RiscoRecomendacao[],
): ResultadoRiscoTotal {
  if (riscos.length === 0) {
    return {
      pontuacao: 0,
      nivel: "muito_baixo",
      possuiImpedimento: false,
    };
  }

  const possuiImpedimento =
    riscos.some(
      (risco) =>
        risco.impeditivo,
    );

  const maiorRisco = Math.max(
    ...riscos.map(
      (risco) =>
        risco.pontuacao,
    ),
  );

  const mediaRiscos =
    riscos.reduce(
      (total, risco) =>
        total +
        risco.pontuacao,
      0,
    ) / riscos.length;

  const pontuacao =
    maiorRisco * 0.6 +
    mediaRiscos * 0.4;

  return {
    pontuacao: Number(
      Math.min(
        100,
        pontuacao,
      ).toFixed(2),
    ),

    nivel:
      classificarNivel(
        pontuacao,
      ),

    possuiImpedimento,
  };
}