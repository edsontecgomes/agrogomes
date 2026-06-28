import { criarHipoteseCientifica, HipoteseCientifica } from "./hipotese";
import { EvidenciaHipotese } from "./evidencia";
import {
  calcularScoreConfiabilidadeHipotese,
  classificarConfiabilidadeHipotese,
} from "./confiabilidadeHipotese";
import { definirStatusHipotese } from "./validacaoHipotese";

export function gerarHipotesePorFator(
  id: string,
  fator: string,
  impactoEstimadoScHa?: number,
): HipoteseCientifica {
  const impactoTexto =
    impactoEstimadoScHa !== undefined
      ? ` com impacto estimado de ${impactoEstimadoScHa} sc/ha`
      : "";

  return criarHipoteseCientifica(
    id,
    `Possível influência de ${fator}`,
    `O fator ${fator} pode estar relacionado à variação produtiva${impactoTexto}.`,
    fator,
  );
}

export function atualizarHipoteseComEvidencias(
  hipotese: HipoteseCientifica,
  evidencias: EvidenciaHipotese[],
  impactoEstimadoScHa?: number,
): HipoteseCientifica {
  const score = calcularScoreConfiabilidadeHipotese(evidencias);

  return {
    ...hipotese,
    confiabilidade: classificarConfiabilidadeHipotese(score),
    status: definirStatusHipotese(score, impactoEstimadoScHa),
  };
}