import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import { ResultadoEstatisticoEventos } from "./processarEventosAgronomicos";

type SalvarResultadoEstatisticoParams = {
  farmId: string;

  talhaoId?: string;

  ueiId?: string;

  safraId?: string;

  resultado:
    ResultadoEstatisticoEventos;
};

function gerarIdResultado({
  farmId,
  talhaoId,
  ueiId,
  safraId,
}: Omit<
  SalvarResultadoEstatisticoParams,
  "resultado"
>): string {
  return [
    "ESTATISTICA",
    farmId,
    talhaoId ?? "SEM-TALHAO",
    ueiId ?? "SEM-UEI",
    safraId ?? "SEM-SAFRA",
  ].join("-");
}

export async function salvarResultadoEstatistico({
  farmId,
  talhaoId,
  ueiId,
  safraId,
  resultado,
}: SalvarResultadoEstatisticoParams): Promise<string> {
  const resultadoId =
    gerarIdResultado({
      farmId,
      talhaoId,
      ueiId,
      safraId,
    });

  const referencia = doc(
    db,
    "resultados_estatisticos",
    resultadoId,
  );

  await setDoc(
    referencia,
    {
      id:
        resultadoId,

      farmId,

      talhaoId:
        talhaoId ?? null,

      ueiId:
        ueiId ?? null,

      safraId:
        safraId ?? null,

      totalEventos:
        resultado.totalEventos,

      totalAmostras:
        resultado.totalAmostras,

      resultados:
        resultado.resultados,

      processadoEm:
        resultado.processadoEm,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  return resultadoId;
}