export function normalizarIdRecomendacao(
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

export function gerarIdRecomendacao(params: {
  entidadeId: string;
  alternativaId: string;
  safraId?: string;
}): string {
  return [
    "REC",
    normalizarIdRecomendacao(
      params.entidadeId,
    ),
    normalizarIdRecomendacao(
      params.alternativaId,
    ),
    params.safraId
      ? normalizarIdRecomendacao(
          params.safraId,
        )
      : "sem-safra",
  ].join("-");
}