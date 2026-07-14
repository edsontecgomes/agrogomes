import { ProcessadorAgronomico } from "./ProcessadorAgronomico";
import type {
  EntradaOrquestradorAgronomico,
  ResultadoOrquestradorAgronomico,
} from "./types";

const processadorAgronomico =
  new ProcessadorAgronomico();

export async function processarEventoAgronomicoCompleto(
  entrada: EntradaOrquestradorAgronomico,
): Promise<ResultadoOrquestradorAgronomico> {
  return processadorAgronomico.processar(
    entrada,
  );
}