import { pontoPertenceAUEI } from "./pontoPertenceAUEI";
import {
  CoordenadaEspacial,
  UEIEspacial,
} from "./types";

export function localizarUEIsPorPonto(
  localizacao: CoordenadaEspacial,
  ueis: UEIEspacial[],
): UEIEspacial[] {
  if (!Array.isArray(ueis) || ueis.length === 0) {
    return [];
  }

  return ueis.filter((uei) =>
    pontoPertenceAUEI(localizacao, uei),
  );
}