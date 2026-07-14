import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import type {
  EntradaOrquestradorAgronomico,
  ResultadoOrquestradorAgronomico,
} from "./types";

type SalvarCheckpointParams = {
  entrada:
    EntradaOrquestradorAgronomico;

  resultado:
    ResultadoOrquestradorAgronomico;
};

export async function salvarCheckpointProcessamento({
  entrada,
  resultado,
}: SalvarCheckpointParams): Promise<void> {
  const referencia = doc(
    db,
    "processamentos_agronomicos",
    resultado.chaveIdempotencia,
  );

  await setDoc(
    referencia,
    {
      chaveIdempotencia:
        resultado.chaveIdempotencia,

      processamentoId:
        resultado.processamentoId,

      processamentoAnteriorId:
        resultado.processamentoAnteriorId ??
        null,

      producerId:
        entrada.contexto.producerId,

      farmId:
        entrada.contexto.farmId,

      talhaoId:
        entrada.contexto.talhaoId ??
        null,

      tipoEvento:
        entrada.entrada.tipo,

      origemSolicitacao:
        entrada.origemSolicitacao ??
        "sistema",

      status:
        resultado.status,

      tentativas:
        resultado.tentativas,

      ultimaEtapaConcluida:
        resultado.ultimaEtapaConcluida ??
        null,

      etapaComFalha:
        resultado.etapaComFalha ??
        null,

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

export async function salvarCheckpointSemInterromper(
  entrada:
    EntradaOrquestradorAgronomico,
  resultado:
    ResultadoOrquestradorAgronomico,
): Promise<boolean> {
  try {
    await salvarCheckpointProcessamento({
      entrada,
      resultado,
    });

    return true;
  } catch (erro) {
    console.warn(
      "Não foi possível salvar o checkpoint do processamento:",
      erro,
    );

    return false;
  }
}