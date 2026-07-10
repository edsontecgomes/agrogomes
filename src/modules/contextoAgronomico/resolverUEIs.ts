import { resolverUEIPorLocalizacao } from "../motorEspacial/resolverUEIPorLocalizacao";
import { ResultadoResolucaoUEI } from "../motorEspacial/types";

import { CoordenadaContexto } from "./types";

type ResolverUEIsParams = {
  farmId: string;
  talhaoId?: string;
  localizacao?: CoordenadaContexto;
};

export async function resolverUEIsDetalhado({
  farmId,
  talhaoId,
  localizacao,
}: ResolverUEIsParams): Promise<ResultadoResolucaoUEI> {
  if (!talhaoId) {
    return {
      ueiIds: [],
      ueis: [],
      metodo: "nenhuma_uei",
      confiabilidade: 0,
      observacoes: [
        "Não foi possível resolver UEIs porque o talhão não foi identificado.",
      ],
    };
  }

  return resolverUEIPorLocalizacao({
    farmId,
    talhaoId,
    localizacao,
  });
}

export async function resolverUEIs(
  farmId: string,
  talhaoId?: string,
  localizacao?: CoordenadaContexto,
): Promise<string[]> {
  const resultado = await resolverUEIsDetalhado({
    farmId,
    talhaoId,
    localizacao,
  });

  return resultado.ueiIds;
}