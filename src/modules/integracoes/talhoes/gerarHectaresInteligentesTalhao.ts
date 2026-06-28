import { CelulaGridHectare } from "../../onboarding/geometriaTalhao/gridHectare";
import { converterGridParaHectaresInteligentes } from "../../onboarding/geometriaTalhao/hectareInteligenteGrid";

export function gerarHectaresInteligentesTalhao(
  talhaoId: string,
  grid: CelulaGridHectare[],
) {
  return converterGridParaHectaresInteligentes(talhaoId, grid);
}