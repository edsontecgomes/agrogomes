import { CelulaGridHectare } from "./gridHectare";

export type HectareInteligenteGerado = {
  hectareId: string;
  talhaoId: string;
  numero: number;
  areaHa: number;
  origem: "grid_1ha";
};

export function converterGridParaHectaresInteligentes(
  talhaoId: string,
  grid: CelulaGridHectare[],
): HectareInteligenteGerado[] {
  return grid.map((celula) => ({
    hectareId: celula.id,
    talhaoId,
    numero: celula.numero,
    areaHa: celula.areaHa,
    origem: "grid_1ha",
  }));
}