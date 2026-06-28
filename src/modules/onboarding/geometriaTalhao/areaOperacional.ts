import { PoligonoTalhao } from "./tiposGeometria";
import { calcularAreaAposBordadura } from "./bordadura";

export type AreaOperacionalTalhao = {
  limiteOriginal: PoligonoTalhao;
  limiteOperacional: PoligonoTalhao;
  areaTotalHa: number;
  areaOperacionalHa: number;
  bordaduraPercentual: number;
};

export function criarAreaOperacional(
  limiteOriginal: PoligonoTalhao,
  areaTotalHa: number,
  bordaduraPercentual = 15,
): AreaOperacionalTalhao {
  return {
    limiteOriginal,
    limiteOperacional: limiteOriginal,
    areaTotalHa,
    areaOperacionalHa: calcularAreaAposBordadura(areaTotalHa, bordaduraPercentual),
    bordaduraPercentual,
  };
}