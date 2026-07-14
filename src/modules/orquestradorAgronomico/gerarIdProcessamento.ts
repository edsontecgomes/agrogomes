function normalizarParteId(
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

function gerarParteAleatoria(): string {
  return Math.random()
    .toString(36)
    .slice(2, 10);
}

export function gerarIdProcessamento(
  tipoEvento: string,
  farmId: string,
): string {
  const timestamp = Date.now();

  return [
    "PROC",
    normalizarParteId(farmId),
    normalizarParteId(tipoEvento),
    String(timestamp),
    gerarParteAleatoria(),
  ].join("-");
}