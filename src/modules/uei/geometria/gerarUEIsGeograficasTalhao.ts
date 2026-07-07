import {
  CoordenadaGeografica,
  gerarGridGeograficoBasico,
} from "../../geometria";
import { converterGridParaUEIs, UEIGeometrica } from "./converterGridParaUEIs";

type GerarUEIsGeograficasTalhaoParams = {
  talhaoId: string;
  coordenadasTalhao: CoordenadaGeografica[];
  areaAlvoHa?: number;
  areaMinimaHa?: number;
};

export function gerarUEIsGeograficasTalhao({
  talhaoId,
  coordenadasTalhao,
  areaAlvoHa = 1,
  areaMinimaHa = 0.2,
}: GerarUEIsGeograficasTalhaoParams): UEIGeometrica[] {
  const grid = gerarGridGeograficoBasico({
    talhaoId,
    coordenadasTalhao,
    areaAlvoHa,
    areaMinimaHa,
  });

  return converterGridParaUEIs(talhaoId, grid);
}