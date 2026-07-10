import { FatorQualidadeEvento } from "./types";

export function avaliarQualidadePayload(
  payloadOriginal?: Record<string, unknown>,
): FatorQualidadeEvento {
  const possuiPayload = Boolean(
    payloadOriginal && Object.keys(payloadOriginal).length > 0,
  );

  return {
    nome: "payload_original",
    peso: 15,
    atingido: possuiPayload,
    observacao: possuiPayload
      ? "Payload original preservado."
      : "Payload original ausente.",
  };
}