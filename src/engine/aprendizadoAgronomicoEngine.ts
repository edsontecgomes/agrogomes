import { criarAprendizadoAPartirDeRelacao } from "../domain/aprendizados/aprendizadoAgronomicoDomain";
import { RelacaoAgronomica } from "../types/relacaoAgronomica";
import { AprendizadoAgronomico } from "../types/aprendizadoAgronomico";

export function gerarAprendizadoPorRelacao(
  relacao: RelacaoAgronomica,
  createdBy: string
): Omit<AprendizadoAgronomico, "id" | "createdAt" | "updatedAt"> {
  return criarAprendizadoAPartirDeRelacao({
    relacao,
    createdBy,
  });
}