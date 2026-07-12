import { agruparAmostrasPorFator } from "./agruparAmostrasPorFator";
import { calcularConfiabilidadeAmostra } from "./calcularConfiabilidadeAmostra";
import { calcularCorrelacaoPearson } from "./calcularCorrelacaoPearson";
import { calcularRegressaoLinear } from "./calcularRegressaoLinear";
import { calcularResumoEstatistico } from "./calcularResumoEstatistico";
import { criarParesFatores } from "./criarParesFatores";
import { detectarOutliersIQR } from "./detectarOutliersIQR";
import {
  AmostraEstatistica,
  ResultadoMotorEstatistico,
} from "./types";

type ProcessarMotorEstatisticoParams = {
  fatorPrincipal: string;

  amostras: AmostraEstatistica[];

  fatoresRelacionados?: string[];
};

export function processarMotorEstatistico({
  fatorPrincipal,
  amostras,
  fatoresRelacionados = [],
}: ProcessarMotorEstatisticoParams): ResultadoMotorEstatistico {
  const amostrasDoFator =
    amostras.filter(
      (amostra) =>
        amostra.fator ===
        fatorPrincipal,
    );

  const resultadoOutliers =
    detectarOutliersIQR(
      amostrasDoFator,
    );

  const valoresValidos =
    resultadoOutliers.amostrasValidas.map(
      (amostra) =>
        amostra.valor,
    );

  const resumo =
    calcularResumoEstatistico(
      valoresValidos,
    );

  const correlacoes =
    fatoresRelacionados.map(
      (fatorRelacionado) => {
        const pares =
          criarParesFatores(
            amostras,
            fatorPrincipal,
            fatorRelacionado,
          );

        return calcularCorrelacaoPearson(
          fatorPrincipal,
          pares.valoresX,
          fatorRelacionado,
          pares.valoresY,
        );
      },
    );

  const regressoes =
    fatoresRelacionados.map(
      (fatorRelacionado) => {
        const pares =
          criarParesFatores(
            amostras,
            fatorPrincipal,
            fatorRelacionado,
          );

        return calcularRegressaoLinear(
          fatorPrincipal,
          pares.valoresX,
          fatorRelacionado,
          pares.valoresY,
        );
      },
    );

  const grupos =
    agruparAmostrasPorFator(
      amostras,
    );

  const comparacoes = grupos
    .filter(
      (grupo) =>
        grupo.fator !==
        fatorPrincipal,
    )
    .slice(0, 0);

  return {
    fatorPrincipal,

    amostrasValidas:
      resultadoOutliers.amostrasValidas,

    amostrasDescartadas:
      resultadoOutliers.outliers.length,

    resumo,

    correlacoes,

    regressoes,

    comparacoes,

    outlierIds:
      resultadoOutliers.outliers.map(
        (amostra, indice) =>
          amostra.id ??
          `OUTLIER-${indice + 1}`,
      ),

    confiabilidadeGeral:
      calcularConfiabilidadeAmostra(
        resumo,
      ),

    processadoEm:
      new Date(),
  };
}