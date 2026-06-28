import { criarRelacaoDecisaoResultado } from "../domain/relacoes/relacaoAgronomicaDomain";
import { DecisaoAgronomica } from "../types/decisaoAgronomica";
import { ResultadoAgronomico } from "../types/resultadoAgronomico";
import { RelacaoAgronomica } from "../types/relacaoAgronomica";

export function gerarRelacaoEntreDecisaoEResultado(
  decisao: DecisaoAgronomica,
  resultado: ResultadoAgronomico,
  createdBy: string
): Omit<RelacaoAgronomica, "id" | "createdAt" | "updatedAt"> {
  return criarRelacaoDecisaoResultado({
    decisao,
    resultado,
    createdBy,
  });
}