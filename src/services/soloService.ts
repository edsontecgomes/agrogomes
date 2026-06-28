import { analisarSolo } from "../engine/soloEngine";
import { salvarAnaliseSolo } from "../repositories/analiseSoloRepository";
import { AnaliseSolo } from "../types/analiseSolo";

type CriarAnaliseSoloInput = Omit<
  AnaliseSolo,
  "id" | "createdAt" | "updatedAt"
>;

export async function registrarAnaliseSolo(
  payload: CriarAnaliseSoloInput
): Promise<string> {
  return salvarAnaliseSolo(payload);
}

export function processarAnaliseSolo(analise: AnaliseSolo) {
  return analisarSolo(analise);
}