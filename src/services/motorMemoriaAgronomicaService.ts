import { gerarResumoMemoriaAgronomica } from "../engine/memoriaAgronomicaEngine";

export async function reconstruirResumoMemoriaAgronomica(
  memoriaAgronomicaId: string
) {
  return gerarResumoMemoriaAgronomica(memoriaAgronomicaId);
}