import type {
  EventoAgronomico,
} from "../eventosAgronomicos/types";

import type {
  EntradaOrquestradorAgronomico,
} from "./types";

export type ContextoMotoresPosteriores = {
  producerId: string;

  farmId: string;

  talhaoId?: string;

  ueiId?: string;

  gdaId?: string;

  safraId?: string;

  cultura?: string;

  areaHa?: number;

  cultivarAtual?: string;

  populacaoAtual?: number;

  produtividadeHistoricaScHa?: number;
};

function lerString(
  valor: unknown,
): string | undefined {
  return typeof valor === "string" &&
    valor.trim()
    ? valor
    : undefined;
}

function lerNumero(
  valor: unknown,
): number | undefined {
  return typeof valor === "number" &&
    Number.isFinite(valor)
    ? valor
    : undefined;
}

export function extrairContextoMotores(
  entrada: EntradaOrquestradorAgronomico,
  evento: EventoAgronomico,
): ContextoMotoresPosteriores {
  const payload =
    evento.payloadOriginal;

  const contextoPayload =
    payload.contexto as
      | Record<string, unknown>
      | undefined;

  return {
    producerId:
      evento.producerId ||
      entrada.contexto.producerId,

    farmId:
      evento.farmId ||
      entrada.contexto.farmId,

    talhaoId:
      evento.talhaoId ??
      entrada.contexto.talhaoId,

    ueiId:
      evento.ueiIds?.[0],

    gdaId:
      evento.gdaIds?.[0],

    safraId:
      lerString(
        contextoPayload?.safraId,
      ) ??
      lerString(
        payload.safraId,
      ),

    cultura:
      lerString(
        contextoPayload?.cultura,
      ) ??
      lerString(
        payload.cultura,
      ),

    areaHa:
      lerNumero(
        payload.areaHa,
      ),

    cultivarAtual:
      lerString(
        payload.cultivar,
      ),

    populacaoAtual:
      lerNumero(
        payload.populacaoPlantasHa,
      ) ??
      lerNumero(
        payload.populacaoAtual,
      ),

    produtividadeHistoricaScHa:
      lerNumero(
        payload.produtividadeScHa,
      ),
  };
}