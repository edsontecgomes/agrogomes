import { gerarRelacaoEntreDecisaoEResultado } from "../engine/relacoesAgronomicasEngine";
import { salvarRelacaoAgronomica } from "../repositories/relacaoAgronomicaRepository";
import { DecisaoAgronomica } from "../types/decisaoAgronomica";
import { ResultadoAgronomico } from "../types/resultadoAgronomico";

export async function registrarRelacaoDecisaoResultado(
  decisao: DecisaoAgronomica,
  resultado: ResultadoAgronomico,
  createdBy: string
): Promise<string> {
  const relacao = gerarRelacaoEntreDecisaoEResultado(
    decisao,
    resultado,
    createdBy
  );

  return salvarRelacaoAgronomica(relacao);
}