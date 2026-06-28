import { calcularResumoMemoriaAgronomica } from "../domain/memoriaAgronomica/memoriaAgronomicaResumoDomain";
import { carregarDadosMemoriaAgronomica } from "../repositories/memoriaAgronomicaRepository";
import { MemoriaAgronomicaResumo } from "../types/memoriaAgronomicaResumo";

export async function gerarResumoMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<MemoriaAgronomicaResumo> {
  const dados = await carregarDadosMemoriaAgronomica(memoriaAgronomicaId);

  return calcularResumoMemoriaAgronomica({
    memoriaAgronomicaId,
    ...dados,
  });
}