import { CoordenadaEvento } from "../types";
import { FatorQualidadeEvento } from "./types";

export function avaliarQualidadeGPS(
  localizacao?: CoordenadaEvento,
): FatorQualidadeEvento {
  if (!localizacao) {
    return {
      nome: "localizacao",
      peso: 25,
      atingido: false,
      observacao: "Evento sem localização.",
    };
  }

  if (localizacao.accuracy && localizacao.accuracy > 30) {
    return {
      nome: "localizacao",
      peso: 25,
      atingido: false,
      observacao: "Precisão GPS baixa.",
    };
  }

  return {
    nome: "localizacao",
    peso: 25,
    atingido: true,
    observacao: "Localização válida.",
  };
}