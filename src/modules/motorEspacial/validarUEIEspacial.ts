import { normalizarPoligono } from "./normalizarPoligono";
import { UEIEspacial } from "./types";

export type ResultadoValidacaoUEI = {
  valida: boolean;
  problemas: string[];
};

export function validarUEIEspacial(
  uei: UEIEspacial,
): ResultadoValidacaoUEI {
  const problemas: string[] = [];

  if (!uei.id) {
    problemas.push("UEI sem identificador.");
  }

  if (!uei.farmId) {
    problemas.push("UEI sem farmId.");
  }

  if (!uei.talhaoId) {
    problemas.push("UEI sem talhaoId.");
  }

  if (!Number.isFinite(uei.areaHa) || uei.areaHa <= 0) {
    problemas.push("UEI com área inválida.");
  }

  const poligonoNormalizado = normalizarPoligono(uei.geometria);

  if (poligonoNormalizado.length < 4) {
    problemas.push("UEI sem polígono geográfico válido.");
  }

  return {
    valida: problemas.length === 0,
    problemas,
  };
}