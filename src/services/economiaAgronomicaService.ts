import { analisarEconomiaAgronomica } from "../engine/economiaAgronomicaEngine";
import { salvarRegistroEconomicoAgronomico } from "../repositories/economiaAgronomicaRepository";
import { RegistroEconomicoAgronomico } from "../types/economiaAgronomica";

type CriarRegistroEconomicoInput = Omit<
  RegistroEconomicoAgronomico,
  "id" | "createdAt" | "updatedAt"
>;

export async function registrarEconomiaAgronomica(
  payload: CriarRegistroEconomicoInput
): Promise<string> {
  return salvarRegistroEconomicoAgronomico(payload);
}

export function processarEconomiaAgronomica(
  registros: RegistroEconomicoAgronomico[]
) {
  return analisarEconomiaAgronomica(registros);
}