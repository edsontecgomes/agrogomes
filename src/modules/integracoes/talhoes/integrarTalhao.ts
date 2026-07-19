import { TalhaoGeometria } from "../../onboarding/geometriaTalhao/tiposGeometria";

import { TalhaoFirestore } from "./talhaoFirestore";

function obterCoordenadasTalhao(
  talhao: TalhaoFirestore,
) {
  const coordenadas =
    talhao.coordenadas ??
    talhao.pontos ??
    [];

  if (coordenadas.length < 3) {
    throw new Error(
      `O talhão ${talhao.id} não possui coordenadas suficientes para formar um polígono.`,
    );
  }

  return coordenadas;
}

export function integrarTalhaoFirestore(
  talhao: TalhaoFirestore,
): TalhaoGeometria {
  const coordenadas = obterCoordenadasTalhao(talhao);

  return {
    talhaoId: talhao.id,

    nome: talhao.nome,

    limiteReal: {
      pontos: coordenadas,
    },

    areaTotalHa: talhao.areaHa,

    areaOperacionalHa:
      talhao.areaOperacionalHa ??
      talhao.configuracaoGeometria?.areaOperacionalHa,
  };
}