import { criarGDAInicial, garantirGDAFirestore } from "../gda";
import { salvarUEIFirestore } from "./salvarUEIsFirestore";
import { Uei } from "./types";

export async function salvarUEIComGDA(uei: Uei) {
  const ueiId = await salvarUEIFirestore(uei);

  const gda = criarGDAInicial(uei);

  const gdaId = await garantirGDAFirestore(gda);

  return {
    ueiId,
    gdaId,
  };
}