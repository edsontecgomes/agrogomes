import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import type {
  ResultadoOrquestradorAgronomico,
} from "./types";

export async function finalizarRegistroIdempotencia(
  resultado: ResultadoOrquestradorAgronomico,
): Promise<void> {
  const referencia = doc(
    db,
    "processamentos_agronomicos",
    resultado.chaveIdempotencia,
  );

  await setDoc(
    referencia,
    {
      processamentoId:
        resultado.processamentoId,

      processamentoAnteriorId:
        resultado.processamentoAnteriorId ??
        null,

      chaveIdempotencia:
        resultado.chaveIdempotencia,

      status:
        resultado.status,

      tentativas:
        resultado.tentativas,

      eventoAgronomicoId:
        resultado.eventoAgronomicoId ??
        null,

      resultadoCientificoId:
        resultado.resultadoCientificoId ??
        null,

      resultadoEstatisticoId:
        resultado.resultadoEstatisticoId ??
        null,

      aprendizadoIds:
        resultado.aprendizadoIds,

      conhecimentoIds:
        resultado.conhecimentoIds,

      recomendacaoIds:
        resultado.recomendacaoIds,

      etapas:
        resultado.etapas,

      totalAlertas:
        resultado.alertas.length,

      totalErros:
        resultado.erros.length,

      finalizadoEm:
        resultado.finalizadoEm ??
        new Date().toISOString(),

      atualizadoEm:
        new Date().toISOString(),

      updatedAt:
        serverTimestamp(),
    },
    {
      merge:
        true,
    },
  );
}