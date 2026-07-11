import buffer from "@turf/buffer";
import { lineString, point } from "@turf/helpers";

import { normalizarTrajeto } from "./normalizarTrajeto";
import { FaixaOperacionalGeografica } from "./typesCobertura";
import { PontoTrajetoEspacial } from "./typesTrajeto";

export function criarFaixaOperacional(
  trajetos: PontoTrajetoEspacial[],
  larguraOperacionalMetros: number,
): FaixaOperacionalGeografica | null {
  if (
    !Number.isFinite(larguraOperacionalMetros) ||
    larguraOperacionalMetros <= 0
  ) {
    return null;
  }

  const pontos = normalizarTrajeto(trajetos);

  if (pontos.length === 0) {
    return null;
  }

  const raioMetros =
    larguraOperacionalMetros / 2;

  try {
    if (pontos.length === 1) {
      const pontoCentral = point([
        pontos[0].lng,
        pontos[0].lat,
      ]);

      const faixa = buffer(
        pontoCentral,
        raioMetros,
        {
          units: "meters",
          steps: 16,
        },
      );

      return faixa ?? null;
    }

    const linha = lineString(
      pontos.map((pontoTrajeto) => [
        pontoTrajeto.lng,
        pontoTrajeto.lat,
      ]),
    );

    const faixa = buffer(
      linha,
      raioMetros,
      {
        units: "meters",
        steps: 16,
      },
    );

    return faixa ?? null;
  } catch (error) {
    console.error(
      "Erro ao criar faixa operacional:",
      error,
    );

    return null;
  }
}