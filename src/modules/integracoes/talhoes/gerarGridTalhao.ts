import { gerarGridHectaresBasico } from "../../onboarding/geometriaTalhao/gridHectare";

export function gerarGridTalhao(
  talhaoId: string,
  areaOperacionalHa: number,
) {
  return gerarGridHectaresBasico(talhaoId, areaOperacionalHa);
}