import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import type {
  EntradaOrquestradorAgronomico,
} from "./types";

import type {
  RegistroIdempotenciaAgronomica,
  ResultadoReservaIdempotencia,
} from "./typesIdempotencia";

type ReservarChaveParams = {
  processamentoId: string;

  chaveIdempotencia: string;

  entrada:
    EntradaOrquestradorAgronomico;
};

function normalizarRegistro(
  dados: Record<string, unknown>,
  chaveIdempotencia: string,
): RegistroIdempotenciaAgronomica {
  return {
    chaveIdempotencia,

    processamentoId:
      String(
        dados.processamentoId ?? "",
      ),

    processamentoAnteriorId:
      typeof dados.processamentoAnteriorId ===
      "string"
        ? dados.processamentoAnteriorId
        : undefined,

    status:
      dados.status as RegistroIdempotenciaAgronomica["status"],

    tipoEvento:
      String(
        dados.tipoEvento ?? "",
      ),

    producerId:
      String(
        dados.producerId ?? "",
      ),

    farmId:
      String(
        dados.farmId ?? "",
      ),

    talhaoId:
      typeof dados.talhaoId === "string"
        ? dados.talhaoId
        : undefined,

    eventoAgronomicoId:
      typeof dados.eventoAgronomicoId ===
      "string"
        ? dados.eventoAgronomicoId
        : undefined,

    resultadoCientificoId:
      typeof dados.resultadoCientificoId ===
      "string"
        ? dados.resultadoCientificoId
        : undefined,

    resultadoEstatisticoId:
      typeof dados.resultadoEstatisticoId ===
      "string"
        ? dados.resultadoEstatisticoId
        : undefined,

    aprendizadoIds:
      Array.isArray(
        dados.aprendizadoIds,
      )
        ? dados.aprendizadoIds.filter(
            (id): id is string =>
              typeof id === "string",
          )
        : [],

    conhecimentoIds:
      Array.isArray(
        dados.conhecimentoIds,
      )
        ? dados.conhecimentoIds.filter(
            (id): id is string =>
              typeof id === "string",
          )
        : [],

    recomendacaoIds:
      Array.isArray(
        dados.recomendacaoIds,
      )
        ? dados.recomendacaoIds.filter(
            (id): id is string =>
              typeof id === "string",
          )
        : [],

    origemSolicitacao:
      (
        dados.origemSolicitacao ??
        "sistema"
      ) as RegistroIdempotenciaAgronomica["origemSolicitacao"],

    tentativas:
      Number(
        dados.tentativas ?? 1,
      ),

    etapas:
      Array.isArray(dados.etapas)
        ? dados.etapas as RegistroIdempotenciaAgronomica["etapas"]
        : undefined,

    totalAlertas:
      Number(
        dados.totalAlertas ?? 0,
      ),

    totalErros:
      Number(
        dados.totalErros ?? 0,
      ),

    iniciadoEm:
      String(
        dados.iniciadoEm ??
          new Date().toISOString(),
      ),

    finalizadoEm:
      typeof dados.finalizadoEm ===
      "string"
        ? dados.finalizadoEm
        : undefined,

    atualizadoEm:
      String(
        dados.atualizadoEm ??
          new Date().toISOString(),
      ),
  };
}

export async function reservarChaveIdempotencia({
  processamentoId,
  chaveIdempotencia,
  entrada,
}: ReservarChaveParams): Promise<ResultadoReservaIdempotencia> {
  const referencia = doc(
    db,
    "processamentos_agronomicos",
    chaveIdempotencia,
  );

  return runTransaction(
    db,
    async (transacao) => {
      const snapshot =
        await transacao.get(
          referencia,
        );

      const agora =
        new Date().toISOString();

      const origemSolicitacao =
        entrada.origemSolicitacao ??
        "sistema";

      if (!snapshot.exists()) {
        const registro: RegistroIdempotenciaAgronomica = {
          chaveIdempotencia,

          processamentoId,

          status:
            "processando",

          tipoEvento:
            entrada.entrada.tipo,

          producerId:
            entrada.contexto.producerId,

          farmId:
            entrada.contexto.farmId,

          talhaoId:
            entrada.contexto.talhaoId,

          origemSolicitacao,

          tentativas:
            1,

          iniciadoEm:
            agora,

          atualizadoEm:
            agora,
        };

        transacao.set(
          referencia,
          {
            ...registro,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        );

        return {
          reservada:
            true,

          motivo:
            "novo" as const,

          registro,
        };
      }

      const existente =
        normalizarRegistro(
          snapshot.data(),
          chaveIdempotencia,
        );

      const permitirReprocessamento =
        entrada.permitirReprocessamento ===
        true;

      const podeRecuperarFalha =
        existente.status ===
          "falhou" ||
        existente.status ===
          "cancelado";

      if (
        existente.status ===
          "processando" &&
        !permitirReprocessamento
      ) {
        return {
          reservada:
            false,

          motivo:
            "em_processamento" as const,

          registro:
            existente,
        };
      }

      if (
        (
          existente.status ===
            "processado" ||
          existente.status ===
            "processado_com_alertas"
        ) &&
        !permitirReprocessamento
      ) {
        return {
          reservada:
            false,

          motivo:
            "ja_processado" as const,

          registro:
            existente,
        };
      }

      const registro: RegistroIdempotenciaAgronomica = {
        ...existente,

        processamentoAnteriorId:
          existente.processamentoId,

        processamentoId,

        status:
          "processando",

        origemSolicitacao:
          permitirReprocessamento
            ? "reprocessamento"
            : origemSolicitacao,

        tentativas:
          Math.max(
            1,
            existente.tentativas,
          ) + 1,

        iniciadoEm:
          agora,

        finalizadoEm:
          undefined,

        atualizadoEm:
          agora,

        totalAlertas:
          0,

        totalErros:
          0,
      };

      transacao.set(
        referencia,
        {
          ...registro,

          finalizadoEm:
            null,

          updatedAt:
            serverTimestamp(),
        },
        {
          merge:
            true,
        },
      );

      return {
        reservada:
          true,

        motivo:
          podeRecuperarFalha
            ? "recuperacao_falha" as const
            : "reprocessamento" as const,

        registro,
      };
    },
  );
}