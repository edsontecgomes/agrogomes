import type {
  ProcessamentoAuditoriaResumo,
  ResumoPainelAuditoria,
} from "./typesPainelAuditoria";

function calcularDuracao(
  processamento:
    ProcessamentoAuditoriaResumo,
): number | undefined {
  if (
    !processamento.iniciadoEm ||
    !processamento.finalizadoEm
  ) {
    return undefined;
  }

  const inicio =
    Date.parse(
      processamento.iniciadoEm,
    );

  const fim =
    Date.parse(
      processamento.finalizadoEm,
    );

  if (
    Number.isNaN(inicio) ||
    Number.isNaN(fim)
  ) {
    return undefined;
  }

  return Math.max(
    0,
    fim - inicio,
  );
}

export function resumirPainelAuditoria(
  processamentos:
    ProcessamentoAuditoriaResumo[],
): ResumoPainelAuditoria {
  const duracoes =
    processamentos
      .map(
        calcularDuracao,
      )
      .filter(
        (
          duracao,
        ): duracao is number =>
          duracao !== undefined,
      );

  const tempoMedioMs =
    duracoes.length > 0
      ? duracoes.reduce(
          (total, duracao) =>
            total + duracao,
          0,
        ) / duracoes.length
      : 0;

  return {
    totalProcessamentos:
      processamentos.length,

    totalProcessados:
      processamentos.filter(
        (processamento) =>
          processamento.status ===
          "processado",
      ).length,

    totalComAlertas:
      processamentos.filter(
        (processamento) =>
          processamento.status ===
          "processado_com_alertas",
      ).length,

    totalFalhas:
      processamentos.filter(
        (processamento) =>
          processamento.status ===
          "falhou",
      ).length,

    totalEmAndamento:
      processamentos.filter(
        (processamento) =>
          processamento.status ===
            "recebido" ||
          processamento.status ===
            "validando" ||
          processamento.status ===
            "processando",
      ).length,

    totalReprocessaveis:
      processamentos.filter(
        (processamento) =>
          processamento.status ===
            "falhou" ||
          processamento.status ===
            "processado_com_alertas",
      ).length,

    tempoMedioMs:
      Number(
        tempoMedioMs.toFixed(0),
      ),
  };
}