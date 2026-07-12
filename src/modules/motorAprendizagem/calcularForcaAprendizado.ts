import {
  AprendizadoAgronomico,
  StatusAprendizado,
} from "./types";

type BaseForcaAprendizado = Pick<
  AprendizadoAgronomico,
  | "evidencias"
  | "numeroEventos"
  | "numeroSafras"
  | "numeroUEIs"
>;

export function calcularForcaAprendizado(
  aprendizado: BaseForcaAprendizado,
): number {
  const evidenciasFavoraveis =
    aprendizado.evidencias.filter(
      (evidencia) =>
        evidencia.favoravel,
    );

  const pesoFavoravel =
    evidenciasFavoraveis.reduce(
      (total, evidencia) =>
        total +
        evidencia.peso *
          evidencia.confiabilidade,
      0,
    );

  const fatorEvidencias = Math.min(
    1,
    pesoFavoravel / 10,
  );

  const fatorEventos = Math.min(
    1,
    aprendizado.numeroEventos / 20,
  );

  const fatorSafras = Math.min(
    1,
    aprendizado.numeroSafras / 3,
  );

  const fatorUEIs = Math.min(
    1,
    aprendizado.numeroUEIs / 20,
  );

  const forca =
    fatorEvidencias * 0.35 +
    fatorEventos * 0.25 +
    fatorSafras * 0.25 +
    fatorUEIs * 0.15;

  return Number(
    (forca * 100).toFixed(2),
  );
}

export function classificarStatusAprendizado(
  forca: number,
  possuiContradicao: boolean,
): StatusAprendizado {
  if (possuiContradicao) {
    return "contraditorio";
  }

  if (forca >= 80) {
    return "forte";
  }

  if (forca >= 60) {
    return "consistente";
  }

  if (forca >= 30) {
    return "em_observacao";
  }

  return "inicial";
}