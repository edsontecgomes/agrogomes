import { calcularConfiabilidadeAmostra } from "./calcularConfiabilidadeAmostra";
import { calcularResumoEstatistico } from "./calcularResumoEstatistico";
import { ComparacaoGruposEstatistica } from "./types";

function calcularTamanhoEfeito(
  mediaA: number,
  mediaB: number,
  desvioA: number,
  desvioB: number,
): number {
  const desvioAgrupado = Math.sqrt(
    (
      Math.pow(desvioA, 2) +
      Math.pow(desvioB, 2)
    ) / 2,
  );

  if (desvioAgrupado === 0) {
    return 0;
  }

  return (
    (mediaA - mediaB) /
    desvioAgrupado
  );
}

export function compararGruposEstatisticamente(
  grupoA: string,
  valoresA: number[],
  grupoB: string,
  valoresB: number[],
  limitePratico = 5,
): ComparacaoGruposEstatistica {
  const resumoA =
    calcularResumoEstatistico(valoresA);

  const resumoB =
    calcularResumoEstatistico(valoresB);

  const diferencaMedia =
    resumoA.media - resumoB.media;

  const diferencaPercentual =
    resumoB.media === 0
      ? 0
      : (
          diferencaMedia /
          resumoB.media
        ) *
        100;

  const tamanhoEfeito =
    calcularTamanhoEfeito(
      resumoA.media,
      resumoB.media,
      resumoA.desvioPadrao,
      resumoB.desvioPadrao,
    );

  const confiabilidade =
    (
      calcularConfiabilidadeAmostra(
        resumoA,
      ) +
      calcularConfiabilidadeAmostra(
        resumoB,
      )
    ) / 2;

  return {
    grupoA,
    grupoB,

    resumoA,
    resumoB,

    diferencaMedia: Number(
      diferencaMedia.toFixed(4),
    ),

    diferencaPercentual: Number(
      diferencaPercentual.toFixed(2),
    ),

    tamanhoEfeito: Number(
      tamanhoEfeito.toFixed(4),
    ),

    significativaNaPratica:
      Math.abs(diferencaMedia) >=
      limitePratico,

    confiabilidade: Number(
      confiabilidade.toFixed(2),
    ),
  };
}