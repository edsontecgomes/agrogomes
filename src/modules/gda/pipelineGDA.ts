import { criarGDA } from "./GDA";
import { criarMemoriaAgronomicaGDA } from "./memoriaAgronomica";
import { salvarGDAComMemoria } from "./salvarGDA";

export async function criarGDAParaUEI(params: {
  producerId: string;
  farmId: string;
  talhaoId: string;
  ueiId: string;
  nome: string;
}) {
  const gda = criarGDA(params);

  const memoria = criarMemoriaAgronomicaGDA({
    gdaId: gda.id,
    ueiId: params.ueiId,
    farmId: params.farmId,
    talhaoId: params.talhaoId,
  });

  await salvarGDAComMemoria(gda, memoria);

  return { gda, memoria };
}