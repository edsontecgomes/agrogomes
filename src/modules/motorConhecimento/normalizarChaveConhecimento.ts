export function normalizarChaveConhecimento(
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

export function gerarIdConhecimento(params: {
  entidadeId: string;
  fatorPrincipal: string;
}): string {
  const entidade =
    normalizarChaveConhecimento(
      params.entidadeId,
    );

  const fator =
    normalizarChaveConhecimento(
      params.fatorPrincipal,
    );

  return [
    "CON",
    entidade,
    fator,
  ].join("-");
}

export function gerarChaveConhecimento(params: {
  escopo: string;
  entidadeId: string;
  fatorPrincipal: string;
}): string {
  return [
    normalizarChaveConhecimento(
      params.escopo,
    ),
    normalizarChaveConhecimento(
      params.entidadeId,
    ),
    normalizarChaveConhecimento(
      params.fatorPrincipal,
    ),
  ].join(":");
}