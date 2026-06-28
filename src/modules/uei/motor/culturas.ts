export type CulturaAgroGomes = "milho" | "soja" | "algodao";

export const CULTURAS_PRIORITARIAS: CulturaAgroGomes[] = ["milho", "soja"];

export const CULTURAS_FUTURAS: CulturaAgroGomes[] = ["algodao"];

export function culturaEstaAtiva(cultura: CulturaAgroGomes) {
  return CULTURAS_PRIORITARIAS.includes(cultura);
}