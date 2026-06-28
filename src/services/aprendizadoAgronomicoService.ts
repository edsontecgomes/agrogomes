import { gerarAprendizadoPorRelacao } from "../engine/aprendizadoAgronomicoEngine";
import { salvarAprendizadoAgronomico } from "../repositories/aprendizadoAgronomicoRepository";
import { RelacaoAgronomica } from "../types/relacaoAgronomica";

export async function registrarAprendizadoPorRelacao(
  relacao: RelacaoAgronomica,
  createdBy: string
): Promise<string> {
  const aprendizado = gerarAprendizadoPorRelacao(relacao, createdBy);

  return salvarAprendizadoAgronomico(aprendizado);
}