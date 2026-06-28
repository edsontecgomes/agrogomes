import { PilarUei } from "./pilares";

export type ModeloCientificoUei = {
  ueiId: string;
  safra: string;
  cultura: string;
  pilares: Record<PilarUei, Record<string, unknown>>;
  confiabilidade: number;
};

export function criarModeloCientificoUei(
  ueiId: string,
  safra: string,
  cultura: string,
): ModeloCientificoUei {
  return {
    ueiId,
    safra,
    cultura,
    pilares: {
      ambiente: {},
      genetica: {},
      manejo: {},
      operacao: {},
      resposta_planta: {},
    },
    confiabilidade: 0,
  };
}