import { Coordenada, distanciaMetrosEntrePontos } from "./localizacao";

export type VizinhoHectare = {
  hectareId: string;
  distanciaMetros: number;
};

export function encontrarVizinhosHectare(
  origem: Coordenada,
  candidatos: Array<{ hectareId: string; centroide: Coordenada }>,
  raioMetros: number,
): VizinhoHectare[] {
  return candidatos
    .map((candidato) => ({
      hectareId: candidato.hectareId,
      distanciaMetros: distanciaMetrosEntrePontos(origem, candidato.centroide),
    }))
    .filter((item) => item.distanciaMetros <= raioMetros)
    .sort((a, b) => a.distanciaMetros - b.distanciaMetros);
}