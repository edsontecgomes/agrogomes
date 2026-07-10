import { FatorQualidadeEvento } from "./types";

export function avaliarQualidadeResponsavel(
  responsavelId?: string,
): FatorQualidadeEvento {
  return {
    nome: "responsavel",
    peso: 15,
    atingido: Boolean(responsavelId),
    observacao: responsavelId
      ? "Responsável identificado."
      : "Responsável não identificado.",
  };
}