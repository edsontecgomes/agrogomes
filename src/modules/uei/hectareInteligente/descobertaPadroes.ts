import { DiferencaRelevante } from "./diferencasRelevantes";
import { criarHipoteseAgronomica, HipoteseAgronomica } from "./hipoteseAgronomica";

export function gerarHipotesesPorDiferencas(
  grupoId: string,
  diferencas: DiferencaRelevante[],
): HipoteseAgronomica[] {
  return diferencas
    .filter((diferenca) => diferenca.impactoEstimadoScHa !== undefined)
    .map((diferenca, index) =>
      criarHipoteseAgronomica(
        `${grupoId}-HIP-${index + 1}`,
        `Possível impacto de ${diferenca.fator}`,
        `O fator ${diferenca.fator} pode estar associado a uma diferença de ${diferenca.impactoEstimadoScHa} sc/ha.`,
        diferenca.fator,
        50,
      ),
    );
}