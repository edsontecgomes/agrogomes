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

type SalvarAuditoriaParams = {
  entrada:
    EntradaOrquestradorAgronomico;

  resultado:
    ResultadoOrquestradorAgronomico;
};

function serializarErros(
  resultado: ResultadoOrquestradorAgronomico,
) {
  return resultado.erros.map(
    (erro) => ({
      etapa:
        erro.etapa ?? null,

      codigo:
        erro.codigo,

      mensagem:
        erro.mensagem,

      recuperavel:
        erro.recuperavel,

      criadoEm:
        erro.criadoEm,
    }),
  );
}

export async function salvarAuditoriaProcessamento({
  entrada,
  resultado,
}: SalvarAuditoriaParams): Promise<string> {
  const referencia = doc(
    db,
    "auditorias_processamento_agronomico",
    resultado.processamentoId,
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

      idempotenciaReutilizada:
        resultado.idempotenciaReutilizada,

      tentativas:
        resultado.tentativas,

      status:
        resultado.status,

      origemSolicitacao:
        entrada.origemSolicitacao ??
        "sistema",

      producerId:
        entrada.contexto.producerId,

      farmId:
        entrada.contexto.farmId,

      talhaoId:
        entrada.contexto.talhaoId ??
        null,

      tipoEvento:
        entrada.entrada.tipo,

      origemEvento:
        entrada.entrada.origem,

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

      registros:
        resultado.registros,

      alertas:
        resultado.alertas,

      erros:
        serializarErros(
          resultado,
        ),

      iniciadoEm:
        resultado.iniciadoEm,

      finalizadoEm:
        resultado.finalizadoEm ??
        null,

      duracaoTotalMs:
        resultado.duracaoTotalMs ??
        null,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge:
        true,
    },
  );

  return resultado.processamentoId;
}

export async function salvarAuditoriaSemInterromper(
  entrada: EntradaOrquestradorAgronomico,
  resultado: ResultadoOrquestradorAgronomico,
): Promise<boolean> {
  try {
    await salvarAuditoriaProcessamento({
      entrada,
      resultado,
    });

    return true;
  } catch (erro) {
    console.warn(
      "Não foi possível salvar a auditoria do processamento:",
      erro,
    );

    return false;
  }
}