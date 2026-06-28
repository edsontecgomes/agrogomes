import { analisarOperacaoAgronomica } from "../engine/operacaoAgronomicaEngine";
import { salvarOperacaoAgronomica } from "../repositories/operacaoAgronomicaRepository";
import { OperacaoAgronomica } from "../types/operacaoAgronomica";

type CriarOperacaoAgronomicaInput = Omit<
  OperacaoAgronomica,
  "id" | "createdAt" | "updatedAt"
>;

export async function registrarOperacaoAgronomica(
  payload: CriarOperacaoAgronomicaInput
): Promise<string> {
  return salvarOperacaoAgronomica(payload);
}

export function processarOperacaoAgronomica(
  operacao: OperacaoAgronomica
) {
  return analisarOperacaoAgronomica(operacao);
}