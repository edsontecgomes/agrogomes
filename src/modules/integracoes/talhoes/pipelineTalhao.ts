import { TalhaoFirestore } from "./talhaoFirestore";
import { integrarTalhaoFirestore } from "./integrarTalhao";
import { gerarAreaOperacionalTalhao } from "./gerarAreaOperacionalTalhao";
import { gerarGridTalhao } from "./gerarGridTalhao";
import { gerarHectaresInteligentesTalhao } from "./gerarHectaresInteligentesTalhao";

export function processarTalhaoParaHectaresInteligentes(
  talhao: TalhaoFirestore,
  bordaduraPercentual = 4,
) {
  const geometria = integrarTalhaoFirestore(talhao);
  const areaOperacional = gerarAreaOperacionalTalhao(
    geometria,
    bordaduraPercentual,
  );

  if (!areaOperacional) {
    return {
      geometria,
      areaOperacional: null,
      grid: [],
      hectaresInteligentes: [],
    };
  }

  const grid = gerarGridTalhao(
    talhao.id,
    areaOperacional.areaOperacionalHa,
  );

  return {
    geometria,
    areaOperacional,
    grid,
    hectaresInteligentes: gerarHectaresInteligentesTalhao(talhao.id, grid),
  };
}
