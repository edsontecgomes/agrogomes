import type {
  NomeEtapaAgronomica,
  RegistroEtapaAgronomica,
  StatusProcessamentoAgronomico,
} from "../types";

import type {
  AuditoriaProcessamentoDetalhada,
  ErroAuditoriaAgronomica,
  ProcessamentoAuditoriaResumo,
} from "./typesPainelAuditoria";

function lerString(
  valor: unknown,
): string | undefined {
  return typeof valor === "string" &&
    valor.trim()
    ? valor
    : undefined;
}

function lerNumero(
  valor: unknown,
  padrao = 0,
): number {
  return typeof valor === "number" &&
    Number.isFinite(valor)
    ? valor
    : padrao;
}

function lerStrings(
  valor: unknown,
): string[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function lerEtapas(
  valor: unknown,
): RegistroEtapaAgronomica[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter(
    (
      item,
    ): item is RegistroEtapaAgronomica =>
      typeof item === "object" &&
      item !== null &&
      typeof (
        item as Record<string, unknown>
      ).etapa === "string" &&
      typeof (
        item as Record<string, unknown>
      ).status === "string",
  );
}

function lerErros(
  valor: unknown,
): ErroAuditoriaAgronomica[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.flatMap((item) => {
    if (
      typeof item !== "object" ||
      item === null
    ) {
      return [];
    }

    const dados =
      item as Record<
        string,
        unknown
      >;

    const codigo =
      lerString(dados.codigo);

    const mensagem =
      lerString(dados.mensagem);

    if (!codigo || !mensagem) {
      return [];
    }

    return [
      {
        etapa:
          lerString(
            dados.etapa,
          ) as
            | NomeEtapaAgronomica
            | undefined,

        codigo,

        mensagem,

        recuperavel:
          dados.recuperavel === true,

        criadoEm:
          lerString(
            dados.criadoEm,
          ),
      },
    ];
  });
}

export function normalizarProcessamentoAuditoria(
  id: string,
  dados: Record<string, unknown>,
): ProcessamentoAuditoriaResumo {
  const erros =
    lerErros(dados.erros);

  const alertas =
    lerStrings(dados.alertas);

  return {
    id,

    chaveIdempotencia:
      lerString(
        dados.chaveIdempotencia,
      ) ?? id,

    processamentoId:
      lerString(
        dados.processamentoId,
      ) ?? id,

    processamentoAnteriorId:
      lerString(
        dados.processamentoAnteriorId,
      ),

    producerId:
      lerString(
        dados.producerId,
      ),

    farmId:
      lerString(
        dados.farmId,
      ) ?? "",

    talhaoId:
      lerString(
        dados.talhaoId,
      ),

    tipoEvento:
      lerString(
        dados.tipoEvento,
      ) ??
      "nao_identificado",

    origemSolicitacao:
      lerString(
        dados.origemSolicitacao,
      ),

    status:
      (
        lerString(
          dados.status,
        ) ??
        "recebido"
      ) as StatusProcessamentoAgronomico,

    tentativas:
      lerNumero(
        dados.tentativas,
        1,
      ),

    ultimaEtapaConcluida:
      lerString(
        dados.ultimaEtapaConcluida,
      ) as
        | NomeEtapaAgronomica
        | undefined,

    etapaComFalha:
      lerString(
        dados.etapaComFalha,
      ) as
        | NomeEtapaAgronomica
        | undefined,

    eventoAgronomicoId:
      lerString(
        dados.eventoAgronomicoId,
      ),

    resultadoCientificoId:
      lerString(
        dados.resultadoCientificoId,
      ),

    resultadoEstatisticoId:
      lerString(
        dados.resultadoEstatisticoId,
      ),

    aprendizadoIds:
      lerStrings(
        dados.aprendizadoIds,
      ),

    conhecimentoIds:
      lerStrings(
        dados.conhecimentoIds,
      ),

    recomendacaoIds:
      lerStrings(
        dados.recomendacaoIds,
      ),

    etapas:
      lerEtapas(
        dados.etapas,
      ),

    totalAlertas:
      lerNumero(
        dados.totalAlertas,
        alertas.length,
      ),

    totalErros:
      lerNumero(
        dados.totalErros,
        erros.length,
      ),

    iniciadoEm:
      lerString(
        dados.iniciadoEm,
      ),

    finalizadoEm:
      lerString(
        dados.finalizadoEm,
      ),

    atualizadoEm:
      lerString(
        dados.atualizadoEm,
      ),
  };
}

export function normalizarAuditoriaDetalhada(
  id: string,
  dados: Record<string, unknown>,
): AuditoriaProcessamentoDetalhada {
  const resumo =
    normalizarProcessamentoAuditoria(
      id,
      dados,
    );

  return {
    processamentoId:
      resumo.processamentoId,

    chaveIdempotencia:
      resumo.chaveIdempotencia,

    processamentoAnteriorId:
      resumo.processamentoAnteriorId,

    status:
      resumo.status,

    origemSolicitacao:
      resumo.origemSolicitacao,

    producerId:
      resumo.producerId,

    farmId:
      resumo.farmId,

    talhaoId:
      resumo.talhaoId,

    tipoEvento:
      resumo.tipoEvento,

    origemEvento:
      lerString(
        dados.origemEvento,
      ),

    tentativas:
      resumo.tentativas,

    idempotenciaReutilizada:
      dados.idempotenciaReutilizada ===
      true,

    eventoAgronomicoId:
      resumo.eventoAgronomicoId,

    resultadoCientificoId:
      resumo.resultadoCientificoId,

    resultadoEstatisticoId:
      resumo.resultadoEstatisticoId,

    aprendizadoIds:
      resumo.aprendizadoIds,

    conhecimentoIds:
      resumo.conhecimentoIds,

    recomendacaoIds:
      resumo.recomendacaoIds,

    etapas:
      resumo.etapas,

    registros:
      Array.isArray(
        dados.registros,
      )
        ? dados.registros as AuditoriaProcessamentoDetalhada["registros"]
        : [],

    alertas:
      lerStrings(
        dados.alertas,
      ),

    erros:
      lerErros(
        dados.erros,
      ),

    iniciadoEm:
      resumo.iniciadoEm,

    finalizadoEm:
      resumo.finalizadoEm,

    duracaoTotalMs:
      typeof dados.duracaoTotalMs ===
        "number"
        ? dados.duracaoTotalMs
        : undefined,
  };
}