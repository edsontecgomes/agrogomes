import {
  ContextoAgronomicoResolvido,
  ResolverContextoParams,
} from "./types";

export function resolverContextoPorTalhao(
  params: ResolverContextoParams,
): ContextoAgronomicoResolvido {
  const observacoes: string[] = [];

  if (!params.talhaoId) {
    observacoes.push("Não foi possível resolver contexto por talhão: talhão ausente.");
  }

  return {
    producerId: params.producerId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
    origemResolucao: "talhao_informado",
    localizacao: params.localizacao,
    confiabilidadeContexto: params.talhaoId ? 0.75 : 0.5,
    observacoes,
  };
}