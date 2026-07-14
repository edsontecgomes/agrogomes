import type {
  NomeEtapaAgronomica,
  RegistroProcessamentoAgronomico,
  SeveridadeRegistro,
} from "./types";

type CriarRegistroParams = {
  processamentoId: string;

  etapa?: NomeEtapaAgronomica;

  severidade?: SeveridadeRegistro;

  codigo: string;

  mensagem: string;

  detalhes?: Record<string, unknown>;
};

export function criarRegistroProcessamento({
  processamentoId,
  etapa,
  severidade = "informacao",
  codigo,
  mensagem,
  detalhes,
}: CriarRegistroParams): RegistroProcessamentoAgronomico {
  const criadoEm =
    new Date().toISOString();

  const id = [
    processamentoId,
    etapa ?? "geral",
    codigo,
    String(Date.now()),
  ].join("-");

  return {
    id,

    processamentoId,

    etapa,

    severidade,

    codigo,

    mensagem,

    detalhes,

    criadoEm,
  };
}