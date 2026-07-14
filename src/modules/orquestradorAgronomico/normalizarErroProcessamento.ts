import type {
  ErroProcessamentoAgronomico,
  NomeEtapaAgronomica,
} from "./types";

type NormalizarErroParams = {
  erro: unknown;

  etapa?: NomeEtapaAgronomica;

  codigo?: string;

  recuperavel?: boolean;
};

function obterMensagemErro(
  erro: unknown,
): string {
  if (erro instanceof Error) {
    return erro.message;
  }

  if (typeof erro === "string") {
    return erro;
  }

  try {
    return JSON.stringify(erro);
  } catch {
    return "Erro desconhecido durante o processamento agronômico.";
  }
}

export function normalizarErroProcessamento({
  erro,
  etapa,
  codigo = "ERRO_PROCESSAMENTO",
  recuperavel = true,
}: NormalizarErroParams): ErroProcessamentoAgronomico {
  return {
    etapa,

    codigo,

    mensagem:
      obterMensagemErro(erro),

    erroOriginal:
      erro,

    recuperavel,

    criadoEm:
      new Date().toISOString(),
  };
}