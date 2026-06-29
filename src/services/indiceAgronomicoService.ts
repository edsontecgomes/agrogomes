import { gerarIndiceGeralAgronomico } from "../engine/indiceAgronomicoEngine";
import { salvarIndiceAgronomico } from "../repositories/indiceAgronomicoRepository";

export async function registrarIndiceGeralAgronomico(params: {
  producerId: string;
  farmId: string;
  talhaoId?: string;
  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;
  indiceSolo?: number;
  indiceChuva?: number;
  indiceOperacao?: number;
  indiceProdutividade?: number;
  indiceEconomia?: number;
  createdBy: string;
}): Promise<string> {
  const indice = gerarIndiceGeralAgronomico(params);

  return salvarIndiceAgronomico(indice);
}