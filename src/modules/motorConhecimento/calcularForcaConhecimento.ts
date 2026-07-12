import type {
  ConhecimentoAgronomico,
} from "./types";

type BaseForcaConhecimento = Pick<
  ConhecimentoAgronomico,
  | "evidencias"
  | "totalAprendizados"
  | "totalEventos"
  | "totalSafras"
  | "totalUEIs"
>;

export function calcularForcaConhecimento(
  conhecimento: BaseForcaConhecimento,
): number {
  const evidenciasFavoraveis =
    conhecimento.evidencias.filter(
      (evidencia) =>
        evidencia.favoravel,
    );

  const pesoEvidencias =
    evidenciasFavoraveis.reduce(
      (total, evidencia) =>
        total +
        evidencia.peso *
          evidencia.confiabilidade,
      0,
    );

  const fatorEvidencias = Math.min(
    1,
    pesoEvidencias / 20,
  );

  const fatorAprendizados = Math.min(
    1,
    conhecimento.totalAprendizados / 5,
  );

  const fatorEventos = Math.min(
    1,
    conhecimento.totalEventos / 50,
  );

  const fatorSafras = Math.min(
    1,
    conhecimento.totalSafras / 3,
  );

  const fatorUEIs = Math.min(
    1,
    conhecimento.totalUEIs / 20,
  );

  const resultado =
    fatorEvidencias * 0.3 +
    fatorAprendizados * 0.2 +
    fatorEventos * 0.2 +
    fatorSafras * 0.2 +
    fatorUEIs * 0.1;

  return Number(
    (resultado * 100).toFixed(2),
  );
}