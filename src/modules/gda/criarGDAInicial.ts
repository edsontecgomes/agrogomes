import { serverTimestamp } from "firebase/firestore";

import { Uei } from "../uei/types";
import { GDA } from "./types";

export function criarGDAInicial(uei: Uei): GDA {
  return {
    id: `GDA-${uei.id}`,

    ueiId: uei.id,

    farmId: uei.farmId,

    talhaoId: uei.talhaoId,

    status: "ativo",

    indiceMaturidadeCientifica: 0,

    indiceConfiabilidade: 0,

    totalEventos: 0,

    totalSafras: 0,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };
}