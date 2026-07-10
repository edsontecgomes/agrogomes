import {
  ContextoAgronomicoResolvido,
  ResolverContextoParams,
} from "./types";

export function resolverContextoBasico(
  params: ResolverContextoParams,
): ContextoAgronomicoResolvido {
  const observacoes: string[] = [];

  if (!params.talhaoId) {
    observacoes.push("Talhão não informado.");
  }

  if (!params.localizacao) {
    observacoes.push("Localização não informada.");
  }

  const pontos = [
    Boolean(params.producerId),
    Boolean(params.farmId),
    Boolean(params.talhaoId),
    Boolean(params.localizacao),
  ].filter(Boolean).length;

  return {
    producerId: params.producerId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
    origemResolucao: params.localizacao ? "gps" : "manual",
    localizacao: params.localizacao,
    confiabilidadeContexto: Number((pontos / 4).toFixed(2)),
    observacoes,
  };
}