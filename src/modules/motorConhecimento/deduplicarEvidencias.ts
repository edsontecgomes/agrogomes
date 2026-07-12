import type {
  EvidenciaAprendizado,
} from "../motorAprendizagem/types";

export function deduplicarEvidencias(
  evidencias: EvidenciaAprendizado[],
): EvidenciaAprendizado[] {
  const mapa = new Map<
    string,
    EvidenciaAprendizado
  >();

  evidencias.forEach((evidencia) => {
    const chave = evidencia.id;

    const existente =
      mapa.get(chave);

    if (!existente) {
      mapa.set(
        chave,
        evidencia,
      );

      return;
    }

    const pesoExistente =
      existente.peso *
      existente.confiabilidade;

    const pesoNovo =
      evidencia.peso *
      evidencia.confiabilidade;

    if (pesoNovo > pesoExistente) {
      mapa.set(
        chave,
        evidencia,
      );
    }
  });

  return Array.from(
    mapa.values(),
  );
}