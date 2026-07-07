import { CelulaGridGeografico } from "../../geometria/grid";

export type UEIGeometrica = {
  ueiId: string;
  talhaoId: string;

  numero: number;

  areaHa: number;

  centroide: CelulaGridGeografico["centroide"];

  geometria: CelulaGridGeografico["geometria"];

  origem: "grid_geografico";
};

export function converterGridParaUEIs(
  talhaoId: string,
  grid: CelulaGridGeografico[],
): UEIGeometrica[] {
  return grid.map((celula) => ({
    ueiId: celula.id,

    talhaoId,

    numero: celula.numero,

    areaHa: celula.areaHa,

    centroide: celula.centroide,

    geometria: celula.geometria,

    origem: "grid_geografico",
  }));
}