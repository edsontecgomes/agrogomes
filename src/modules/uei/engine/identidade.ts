export function criarIdPermanenteUei(farmId: string, talhaoId: string, numero: number) {
  const seq = String(numero).padStart(5, "0");
  return `${farmId}-${talhaoId}-UEI-${seq}`;
}

export function normalizarCodigoUei(codigo: string) {
  return codigo.trim().toUpperCase().replace(/\s+/g, "-");
}