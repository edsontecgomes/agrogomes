export function normalizarChaveAprendizado(
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

export function gerarIdAprendizado(params: {
  entidadeId: string;
  fatorPrincipal: string;
  safraId?: string;
}): string {
  const entidade =
    normalizarChaveAprendizado(
      params.entidadeId,
    );

  const fator =
    normalizarChaveAprendizado(
      params.fatorPrincipal,
    );

  const safra = params.safraId
    ? normalizarChaveAprendizado(
        params.safraId,
      )
    : "todas-safras";

  return [
    "APR",
    entidade,
    fator,
    safra,
  ].join("-");
}