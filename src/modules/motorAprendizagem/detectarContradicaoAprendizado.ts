import {
  ContradicaoAprendizado,
  EvidenciaAprendizado,
} from "./types";

export function detectarContradicaoAprendizado(
  aprendizadoId: string,
  evidencias: EvidenciaAprendizado[],
): ContradicaoAprendizado {
  const favoraveis =
    evidencias.filter(
      (evidencia) =>
        evidencia.favoravel,
    );

  const contrarias =
    evidencias.filter(
      (evidencia) =>
        !evidencia.favoravel,
    );

  const pesoFavoravel =
    favoraveis.reduce(
      (total, evidencia) =>
        total +
        evidencia.peso *
          evidencia.confiabilidade,
      0,
    );

  const pesoContrario =
    contrarias.reduce(
      (total, evidencia) =>
        total +
        evidencia.peso *
          evidencia.confiabilidade,
      0,
    );

  const pesoTotal =
    pesoFavoravel + pesoContrario;

  const indiceContradicao =
    pesoTotal > 0
      ? pesoContrario / pesoTotal
      : 0;

  const existeContradicao =
    contrarias.length > 0 &&
    indiceContradicao >= 0.3;

  return {
    aprendizadoId,

    existeContradicao,

    totalFavoraveis:
      favoraveis.length,

    totalContrarias:
      contrarias.length,

    indiceContradicao: Number(
      indiceContradicao.toFixed(2),
    ),

    descricao: existeContradicao
      ? "O aprendizado possui evidências relevantes em sentidos opostos."
      : undefined,
  };
}