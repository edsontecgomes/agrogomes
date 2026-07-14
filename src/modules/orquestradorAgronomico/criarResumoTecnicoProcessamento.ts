import type {
  NomeEtapaAgronomica,
  ResultadoOrquestradorAgronomico,
} from "./types";

export type ResumoTecnicoProcessamento = {
  processamentoId: string;

  status: string;

  eventoPreservado: boolean;

  totalEtapasConcluidas: number;

  totalEtapasComFalha: number;

  totalEtapasIgnoradas: number;

  totalAlertas: number;

  totalErros: number;

  ultimaEtapaConcluida?:
    NomeEtapaAgronomica;

  etapaComFalha?:
    NomeEtapaAgronomica;

  podeReprocessar: boolean;

  idsGerados: {
    eventoAgronomicoId?: string;

    resultadoCientificoId?: string;

    resultadoEstatisticoId?: string;

    aprendizadoIds: string[];

    conhecimentoIds: string[];

    recomendacaoIds: string[];
  };
};

export function criarResumoTecnicoProcessamento(
  resultado:
    ResultadoOrquestradorAgronomico,
): ResumoTecnicoProcessamento {
  return {
    processamentoId:
      resultado.processamentoId,

    status:
      resultado.status,

    eventoPreservado:
      Boolean(
        resultado.eventoAgronomicoId,
      ),

    totalEtapasConcluidas:
      resultado.etapas.filter(
        (etapa) =>
          etapa.status ===
            "concluida" ||
          etapa.status ===
            "concluida_com_alertas",
      ).length,

    totalEtapasComFalha:
      resultado.etapas.filter(
        (etapa) =>
          etapa.status ===
          "falhou",
      ).length,

    totalEtapasIgnoradas:
      resultado.etapas.filter(
        (etapa) =>
          etapa.status ===
          "ignorada",
      ).length,

    totalAlertas:
      resultado.alertas.length,

    totalErros:
      resultado.erros.length,

    ultimaEtapaConcluida:
      resultado.ultimaEtapaConcluida,

    etapaComFalha:
      resultado.etapaComFalha,

    podeReprocessar:
      resultado.erros.some(
        (erro) =>
          erro.recuperavel,
      ),

    idsGerados: {
      eventoAgronomicoId:
        resultado.eventoAgronomicoId,

      resultadoCientificoId:
        resultado.resultadoCientificoId,

      resultadoEstatisticoId:
        resultado.resultadoEstatisticoId,

      aprendizadoIds:
        resultado.aprendizadoIds,

      conhecimentoIds:
        resultado.conhecimentoIds,

      recomendacaoIds:
        resultado.recomendacaoIds,
    },
  };
}