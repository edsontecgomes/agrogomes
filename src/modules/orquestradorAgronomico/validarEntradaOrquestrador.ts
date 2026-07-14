import type {
  EntradaOrquestradorAgronomico,
} from "./types";

export type ResultadoValidacaoEntrada = {
  valida: boolean;

  erros: string[];

  alertas: string[];
};

export function validarEntradaOrquestrador(
  entrada: EntradaOrquestradorAgronomico,
): ResultadoValidacaoEntrada {
  const erros: string[] = [];
  const alertas: string[] = [];

  if (!entrada.contexto.producerId) {
    erros.push(
      "producerId é obrigatório para o processamento agronômico.",
    );
  }

  if (!entrada.contexto.farmId) {
    erros.push(
      "farmId é obrigatório para o processamento agronômico.",
    );
  }

  if (!entrada.entrada.tipo) {
    erros.push(
      "O tipo do evento agronômico é obrigatório.",
    );
  }

  if (!entrada.entrada.origem) {
    erros.push(
      "A origem do evento agronômico é obrigatória.",
    );
  }

  if (
    !entrada.entrada.payloadOriginal ||
    typeof entrada.entrada.payloadOriginal !==
      "object"
  ) {
    erros.push(
      "O payload original do evento é obrigatório.",
    );
  }

  if (!entrada.contexto.talhaoId) {
    alertas.push(
      "O talhão não foi informado. A resolução espacial poderá ficar incompleta.",
    );
  }

  if (!entrada.entrada.localizacao) {
    alertas.push(
      "O evento não possui localização GPS.",
    );
  }

  if (!entrada.entrada.responsavelId) {
    alertas.push(
      "O responsável pelo evento não foi identificado.",
    );
  }

  if (
    entrada.entrada.dataEvento &&
    Number.isNaN(
      Date.parse(
        entrada.entrada.dataEvento,
      ),
    )
  ) {
    erros.push(
      "A data do evento possui formato inválido.",
    );
  }

  return {
    valida:
      erros.length === 0,

    erros,

    alertas,
  };
}