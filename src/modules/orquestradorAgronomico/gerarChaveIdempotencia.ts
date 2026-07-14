import type {
  EntradaOrquestradorAgronomico,
} from "./types";

function normalizar(
  valor: string,
): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashSimples(
  valor: string,
): string {
  let hash = 0;

  for (
    let indice = 0;
    indice < valor.length;
    indice += 1
  ) {
    hash =
      (
        hash * 31 +
        valor.charCodeAt(indice)
      ) >>> 0;
  }

  return hash.toString(36);
}

export function gerarChaveIdempotencia(
  entrada: EntradaOrquestradorAgronomico,
): string {
  if (entrada.chaveIdempotencia) {
    return entrada.chaveIdempotencia;
  }

  const dataEvento =
    entrada.entrada.dataEvento ??
    new Date().toISOString();

  const responsavel =
    entrada.entrada.responsavelId ??
    "sem-responsavel";

  const localizacao =
    entrada.entrada.localizacao
      ? [
          entrada.entrada.localizacao.lat.toFixed(
            6,
          ),
          entrada.entrada.localizacao.lng.toFixed(
            6,
          ),
        ].join(":")
      : "sem-localizacao";

  const base = [
    entrada.contexto.producerId,
    entrada.contexto.farmId,
    entrada.contexto.talhaoId ??
      "sem-talhao",
    entrada.entrada.tipo,
    entrada.entrada.origem,
    dataEvento,
    responsavel,
    localizacao,
    JSON.stringify(
      entrada.entrada.payloadOriginal,
    ),
  ].join("|");

  return [
    "IDEMP",
    normalizar(
      entrada.contexto.farmId,
    ),
    normalizar(
      entrada.entrada.tipo,
    ),
    hashSimples(base),
  ].join("-");
}