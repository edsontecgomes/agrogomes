export type StatusOrdemProgramada =
  | "pendente"
  | "em_execucao"
  | "concluida"
  | "cancelada";

export interface OrdemProgramada {
  id: string;

  planejamentoId: string;
  operacaoId: string;

  talhaoId: string;

  nome: string;

  status: StatusOrdemProgramada;

  dataPrevista?: string;

  operadorId?: string;
  equipamentoId?: string;

  observacoes?: string;

  createdAt?: unknown;
  updatedAt?: unknown;
}