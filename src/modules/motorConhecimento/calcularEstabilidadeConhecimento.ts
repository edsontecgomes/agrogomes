import type {
  ConhecimentoAgronomico,
} from "./types";

type BaseEstabilidadeConhecimento = Pick<
  ConhecimentoAgronomico,
  | "totalSafras"
  | "totalAprendizados"
  | "totalEvidenciasFavoraveis"
  | "totalEvidenciasContrarias"
  | "totalUEIs"
>;

export function calcularEstabilidadeConhecimento(
  conhecimento: BaseEstabilidadeConhecimento,
): number {
  const totalEvidencias =
    conhecimento
      .totalEvidenciasFavoraveis +
    conhecimento
      .totalEvidenciasContrarias;

  const consistencia =
    totalEvidencias > 0
      ? conhecimento
          .totalEvidenciasFavoraveis /
        totalEvidencias
      : 0;

  const fatorSafras = Math.min(
    1,
    conhecimento.totalSafras / 3,
  );

  const fatorAprendizados = Math.min(
    1,
    conhecimento.totalAprendizados / 5,
  );

  const fatorUEIs = Math.min(
    1,
    conhecimento.totalUEIs / 20,
  );

  const resultado =
    consistencia * 0.45 +
    fatorSafras * 0.25 +
    fatorAprendizados * 0.2 +
    fatorUEIs * 0.1;

  return Number(
    (resultado * 100).toFixed(2),
  );
}