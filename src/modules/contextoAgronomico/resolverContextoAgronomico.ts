import {
  ContextoAgronomicoResolvido,
  ResolverContextoParams,
} from "./types";
import { resolverContextoBasico } from "./resolverContextoBasico";
import { resolverContextoPorTalhao } from "./resolverContextoPorTalhao";

export async function resolverContextoAgronomico(
  params: ResolverContextoParams,
): Promise<ContextoAgronomicoResolvido> {
  if (params.talhaoId) {
    return resolverContextoPorTalhao(params);
  }

  return resolverContextoBasico(params);
}