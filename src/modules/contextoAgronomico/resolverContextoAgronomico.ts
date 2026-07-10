import {
  ContextoAgronomicoResolvido,
  ResolverContextoParams,
} from "./types";

import { resolverContextoBasico } from "./resolverContextoBasico";
import { resolverContextoPorTalhao } from "./resolverContextoPorTalhao";
import { resolverUEIsDetalhado } from "./resolverUEIs";
import { resolverGDAs } from "./resolverGDAs";
import { resolverSafra } from "./resolverSafra";
import { resolverCultura } from "./resolverCultura";

function possuiIdsValidos(
  ids?: string[],
): ids is string[] {
  return Boolean(
    ids &&
      ids.length > 0 &&
      ids.some((id) => Boolean(id.trim())),
  );
}

export async function resolverContextoAgronomico(
  params: ResolverContextoParams,
): Promise<ContextoAgronomicoResolvido> {
  const contexto = params.talhaoId
    ? resolverContextoPorTalhao(params)
    : resolverContextoBasico(params);

  contexto.observacoes = [
    ...(contexto.observacoes ?? []),
    ...(params.observacoesEspaciais ?? []),
  ];

  if (possuiIdsValidos(params.ueiIdsResolvidos)) {
    contexto.ueiIds = Array.from(
      new Set(
        params.ueiIdsResolvidos
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    );

    contexto.metodoResolucaoEspacial =
      params.metodoResolucaoEspacial ??
      "intersecao_trajeto";

    contexto.confiabilidadeEspacial =
      params.confiabilidadeEspacial ?? 1;
  } else {
    const resultadoUEIs =
      await resolverUEIsDetalhado({
        farmId: contexto.farmId,
        talhaoId: contexto.talhaoId,
        localizacao: contexto.localizacao,
      });

    contexto.ueiIds = resultadoUEIs.ueiIds;

    contexto.metodoResolucaoEspacial =
      resultadoUEIs.metodo;

    contexto.confiabilidadeEspacial =
      resultadoUEIs.confiabilidade;

    contexto.observacoes.push(
      ...resultadoUEIs.observacoes,
    );
  }

  if (possuiIdsValidos(params.gdaIdsResolvidos)) {
    contexto.gdaIds = Array.from(
      new Set(
        params.gdaIdsResolvidos
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    );
  } else {
    contexto.gdaIds = await resolverGDAs(
      contexto.ueiIds ?? [],
    );
  }

  contexto.safraId = await resolverSafra(
    contexto.farmId,
  );

  contexto.cultura = await resolverCultura(
    contexto.talhaoId,
  );

  let confiabilidade =
    contexto.confiabilidadeContexto;

  if ((contexto.ueiIds ?? []).length > 0) {
    confiabilidade += 0.1;
  }

  if ((contexto.gdaIds ?? []).length > 0) {
    confiabilidade += 0.1;
  }

  if (
    contexto.confiabilidadeEspacial !== undefined
  ) {
    confiabilidade =
      confiabilidade * 0.7 +
      contexto.confiabilidadeEspacial * 0.3;
  }

  contexto.confiabilidadeContexto = Math.min(
    1,
    Number(confiabilidade.toFixed(2)),
  );

  return contexto;
}