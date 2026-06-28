import { CoordenadaTalhao } from "./tiposGeometria";

export type CelulaGridHectare = {
  id: string;
  numero: number;
  areaHa: number;
  centroide?: CoordenadaTalhao;
};

export function gerarGridHectaresBasico(
  talhaoId: string,
  areaOperacionalHa: number,
): CelulaGridHectare[] {
  const total = Math.floor(areaOperacionalHa);

  return Array.from({ length: total }).map((_, index) => ({
    id: `${talhaoId}-HI-${String(index + 1).padStart(5, "0")}`,
    numero: index + 1,
    areaHa: 1,
  }));
}