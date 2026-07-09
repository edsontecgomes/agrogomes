import { OperacaoPlanejada } from "../planejamentoSafra/typesOperacoes";
import { OrdemProgramada } from "./types";

export function gerarOrdensProgramadas(
  talhaoId: string,
  operacoes: OperacaoPlanejada[],
): OrdemProgramada[] {
  return operacoes.map((operacao) => ({
    id: operacao.id,

    planejamentoId: operacao.planejamentoId,

    operacaoId: operacao.id,

    talhaoId,

    nome: operacao.nome,

    status: "pendente",
  }));
}