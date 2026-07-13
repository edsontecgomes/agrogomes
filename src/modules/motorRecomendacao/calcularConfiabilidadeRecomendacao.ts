import type {
  ConhecimentoAgronomico,
} from "../motorConhecimento/types";

export function calcularConfiabilidadeRecomendacao(
  conhecimentos: ConhecimentoAgronomico[],
  compatibilidade: number,
): number {
  if (conhecimentos.length === 0) {
    return 0;
  }

  const confiabilidadeMedia =
    conhecimentos.reduce(
      (total, conhecimento) =>
        total +
        conhecimento.confiabilidade,
      0,
    ) / conhecimentos.length;

  const estabilidadeMedia =
    conhecimentos.reduce(
      (total, conhecimento) =>
        total +
        conhecimento.estabilidade,
      0,
    ) / conhecimentos.length;

  const forcaMedia =
    conhecimentos.reduce(
      (total, conhecimento) =>
        total +
        conhecimento.forca,
      0,
    ) / conhecimentos.length;

  const confiabilidade =
    confiabilidadeMedia * 0.35 +
    (
      estabilidadeMedia / 100
    ) * 0.25 +
    (
      forcaMedia / 100
    ) * 0.25 +
    (
      compatibilidade / 100
    ) * 0.15;

  return Number(
    Math.min(
      1,
      confiabilidade,
    ).toFixed(2),
  );
}