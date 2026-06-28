export type SafraUei = {
  ueiId: string;
  safra: string;
  cultura: string;
  variedade?: string;
  dataPlantio?: string;
  dataColheita?: string;
};

export function criarSafraUei(ueiId: string, safra: string, cultura: string): SafraUei {
  return {
    ueiId,
    safra,
    cultura,
  };
}