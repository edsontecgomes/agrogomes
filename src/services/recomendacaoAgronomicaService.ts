import { gerarRecomendacaoPorAprendizado } from "../engine/recomendacaoAgronomicaEngine";
import { salvarRecomendacaoAgronomica } from "../repositories/recomendacaoAgronomicaRepository";
import { AprendizadoAgronomico } from "../types/aprendizadoAgronomico";

export async function registrarRecomendacaoPorAprendizado(
  aprendizado: AprendizadoAgronomico,
  createdBy: string
): Promise<string> {
  const recomendacao = gerarRecomendacaoPorAprendizado(
    aprendizado,
    createdBy
  );

  return salvarRecomendacaoAgronomica(recomendacao);
}