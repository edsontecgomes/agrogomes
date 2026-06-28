import {
  PESOS_PADRAO_SIMILARIDADE,
  PesosSimilaridadeHectare,
  normalizarPesosSimilaridade,
} from "./pesosSimilaridade";

export type ScoreSimilaridadeHectare = {
  ambiente: number;
  genetica: number;
  manejo: number;
  operacao: number;
  respostaPlanta: number;
};

export function calcularScoreSimilaridadeHectare(
  scores: ScoreSimilaridadeHectare,
  pesos: PesosSimilaridadeHectare = PESOS_PADRAO_SIMILARIDADE,
) {
  const p = normalizarPesosSimilaridade(pesos);

  return (
    (scores.ambiente * p.ambiente +
      scores.genetica * p.genetica +
      scores.manejo * p.manejo +
      scores.operacao * p.operacao +
      scores.respostaPlanta * p.respostaPlanta) /
    100
  );
}