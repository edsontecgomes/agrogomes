import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import { ResultadoMotorCientificoCompleto } from "./typesMotorCientifico";

function gerarIdResultado(
  resultado: ResultadoMotorCientificoCompleto,
): string {
  if (resultado.eventoAgronomicoId) {
    return `RESULTADO-${resultado.eventoAgronomicoId}`;
  }

  return `RESULTADO-${resultado.eventoCientifico.id}`;
}

export async function salvarResultadoMotorCientifico(
  resultado: ResultadoMotorCientificoCompleto,
): Promise<string> {
  const resultadoId =
    gerarIdResultado(resultado);

  const referencia = doc(
    db,
    "resultados_cientificos",
    resultadoId,
  );

  const payload = {
    id: resultadoId,

    eventoAgronomicoId:
      resultado.eventoAgronomicoId ?? null,

    eventoCientifico:
      resultado.eventoCientifico,

    grafo: {
      entidades:
        resultado.grafo.entidades,

      eventos:
        resultado.grafo.eventos,

      relacoes:
        resultado.grafo.relacoes,
    },

    fatores:
      resultado.fatores,

    evidencias:
      resultado.evidencias,

    hipoteses:
      resultado.hipoteses,

    descobertas:
      resultado.descobertas,

    explicacao:
      resultado.explicacao ?? null,

    indicadores: {
      totalEntidades:
        resultado.totalEntidades,

      totalRelacoes:
        resultado.totalRelacoes,

      totalEvidencias:
        resultado.totalEvidencias,

      totalHipoteses:
        resultado.totalHipoteses,

      totalDescobertas:
        resultado.totalDescobertas,
    },

    processadoEm:
      resultado.processadoEm,

    updatedAt:
      serverTimestamp(),
  };

  await setDoc(
    referencia,
    payload,
    {
      merge: true,
    },
  );

  return resultadoId;
}