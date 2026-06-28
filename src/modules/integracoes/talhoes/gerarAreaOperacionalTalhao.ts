import { TalhaoGeometria } from "../../onboarding/geometriaTalhao/tiposGeometria";
import { criarAreaOperacional } from "../../onboarding/geometriaTalhao/areaOperacional";

export function gerarAreaOperacionalTalhao(
  talhao: TalhaoGeometria,
  bordaduraPercentual = 15,
) {
  if (!talhao.areaTotalHa) {
    return null;
  }

  return criarAreaOperacional(
    talhao.limiteReal,
    talhao.areaTotalHa,
    bordaduraPercentual,
  );
}