import type {
  NomeEtapaAgronomica,
  RegistroEtapaAgronomica,
  StatusEtapaAgronomica,
} from "./types";

type AtualizarEtapaParams = {
  etapas: RegistroEtapaAgronomica[];

  etapa: NomeEtapaAgronomica;

  status: StatusEtapaAgronomica;

  mensagem?: string;

  detalhes?: Record<string, unknown>;

  dataReferencia?: string;
};

export function atualizarEtapaProcessamento({
  etapas,
  etapa,
  status,
  mensagem,
  detalhes,
  dataReferencia,
}: AtualizarEtapaParams): RegistroEtapaAgronomica[] {
  const agora =
    dataReferencia ??
    new Date().toISOString();

  return etapas.map((registro) => {
    if (registro.etapa !== etapa) {
      return registro;
    }

    const inicioEm =
      status === "processando"
        ? registro.inicioEm ?? agora
        : registro.inicioEm;

    const finalizou = [
      "concluida",
      "concluida_com_alertas",
      "ignorada",
      "falhou",
    ].includes(status);

    const fimEm = finalizou
      ? agora
      : registro.fimEm;

    const duracaoMs =
      inicioEm && fimEm
        ? Math.max(
            0,
            Date.parse(fimEm) -
              Date.parse(inicioEm),
          )
        : registro.duracaoMs;

    return {
      ...registro,

      status,

      inicioEm,

      fimEm,

      duracaoMs,

      mensagem:
        mensagem ??
        registro.mensagem,

      detalhes:
        detalhes ??
        registro.detalhes,
    };
  });
}