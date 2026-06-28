import { criarRecomendacaoAPartirDeAprendizado } from "../domain/recomendacoes/recomendacaoAgronomicaDomain";
import { AprendizadoAgronomico } from "../types/aprendizadoAgronomico";
import { RecomendacaoAgronomica } from "../types/recomendacaoAgronomica";

export function gerarRecomendacaoPorAprendizado(
  aprendizado: AprendizadoAgronomico,
  createdBy: string
): Omit<RecomendacaoAgronomica, "id" | "createdAt" | "updatedAt"> {
  return criarRecomendacaoAPartirDeAprendizado({
    aprendizado,
    createdBy,
  });
}