import { FatorQualidadeEvento } from "./types";

export function avaliarQualidadeTemporal(
  dataEvento?: string,
): FatorQualidadeEvento {
  const dataValida = Boolean(dataEvento && !Number.isNaN(Date.parse(dataEvento)));

  return {
    nome: "data_evento",
    peso: 15,
    atingido: dataValida,
    observacao: dataValida
      ? "Data do evento válida."
      : "Data do evento ausente ou inválida.",
  };
}