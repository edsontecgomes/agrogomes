import { PontoTrajetoEspacial } from "./typesTrajeto";

function pontoValido(
  ponto: PontoTrajetoEspacial,
): boolean {
  return (
    Number.isFinite(ponto.lat) &&
    Number.isFinite(ponto.lng) &&
    ponto.lat >= -90 &&
    ponto.lat <= 90 &&
    ponto.lng >= -180 &&
    ponto.lng <= 180
  );
}

function pontosIguais(
  primeiro: PontoTrajetoEspacial,
  segundo: PontoTrajetoEspacial,
): boolean {
  return (
    primeiro.lat === segundo.lat &&
    primeiro.lng === segundo.lng
  );
}

export function normalizarTrajeto(
  trajetos: PontoTrajetoEspacial[],
): PontoTrajetoEspacial[] {
  if (!Array.isArray(trajetos)) {
    return [];
  }

  const pontosValidos = trajetos.filter(pontoValido);

  return pontosValidos.filter(
    (ponto, indice, lista) => {
      if (indice === 0) {
        return true;
      }

      return !pontosIguais(
        ponto,
        lista[indice - 1],
      );
    },
  );
}