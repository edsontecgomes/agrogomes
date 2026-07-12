import type {
  ConhecimentoAgronomico,
  NivelMaturidadeConhecimento,
  StatusConhecimento,
} from "./types";

type BaseMaturidade = Pick<
  ConhecimentoAgronomico,
  | "forca"
  | "confiabilidade"
  | "estabilidade"
  | "indiceContradicao"
  | "totalSafras"
>;

export function calcularMaturidadeConhecimento(
  conhecimento: BaseMaturidade,
): NivelMaturidadeConhecimento {
  const confiabilidadePercentual =
    conhecimento.confiabilidade * 100;

  const indice =
    conhecimento.forca * 0.35 +
    confiabilidadePercentual * 0.3 +
    conhecimento.estabilidade * 0.35;

  if (
    conhecimento.indiceContradicao >=
    0.3
  ) {
    return "em_formacao";
  }

  if (
    indice >= 85 &&
    conhecimento.totalSafras >= 3
  ) {
    return "maduro";
  }

  if (indice >= 70) {
    return "avancado";
  }

  if (indice >= 50) {
    return "consistente";
  }

  if (indice >= 25) {
    return "em_formacao";
  }

  return "inicial";
}

export function definirStatusConhecimento(
  conhecimento: BaseMaturidade,
): StatusConhecimento {
  if (
    conhecimento.indiceContradicao >=
    0.3
  ) {
    return "contraditorio";
  }

  const maturidade =
    calcularMaturidadeConhecimento(
      conhecimento,
    );

  if (maturidade === "maduro") {
    return "maduro";
  }

  if (
    maturidade === "avancado" ||
    maturidade === "consistente"
  ) {
    return "consolidado";
  }

  if (
    maturidade === "em_formacao"
  ) {
    return "em_validacao";
  }

  return "provisorio";
}